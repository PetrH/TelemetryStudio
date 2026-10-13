"""Convert FIT record messages into the renderer's telemetry model, locally."""
import datetime
import io
import math
from vendor import fitdecode

MAX_FIT_BYTES = 60_000_000


def number(value):
    if isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value):
        return value
    return None


def record_to_row(frame):
    # Native fields take precedence over developer fields with the same name.
    values = {}
    for field in frame.fields:
        if field.name not in values or values[field.name] is None:
            values[field.name] = field.value
    def pick(*names):
        return next((number(values.get(k)) for k in names if number(values.get(k)) is not None), None)
    stamp = values.get('timestamp')
    if not isinstance(stamp, datetime.datetime):
        return None
    stamp = stamp.timestamp() * 1000
    precise = pick('timestamp_ms')
    # Cadence developer extension stores Unix milliseconds. Do not mistake a
    # different vendor's similarly named field for an absolute timestamp.
    if precise is not None and abs(precise - stamp) < 1000:
        stamp = precise
    lat, lon = pick('position_lat'), pick('position_long')
    speed = pick('enhanced_speed', 'speed')
    return dict(stamp=stamp, active=pick('total_time'),
                lat=None if lat is None else lat * 180 / 2**31,
                lon=None if lon is None else lon * 180 / 2**31,
                speed=None if speed is None else speed * 3.6,
                cadence=pick('cadence', 'cycling_cadence', 'running_cadence'),
                power=pick('power'), hr=pick('heart_rate'),
                altitude=pick('enhanced_altitude', 'altitude'),
                distance=pick('distance'), heading=None)


def parse_fit(data):
    if not data or len(data) > MAX_FIT_BYTES:
        raise ValueError('FIT je prázdný nebo přesahuje limit 60 MB.')
    rows = []
    try:
        with fitdecode.FitReader(io.BytesIO(data), check_crc=fitdecode.CrcCheck.RAISE,
                                 error_handling=fitdecode.ErrorHandling.RAISE) as reader:
            for frame in reader:
                if frame.frame_type == fitdecode.FIT_FRAME_DATA and frame.name == 'record':
                    row = record_to_row(frame)
                    if row is not None:
                        rows.append(row)
    except (fitdecode.FitError, ValueError, TypeError, OverflowError) as exc:
        raise ValueError('FIT je poškozený nebo jej nelze načíst: ' + str(exc)) from exc
    if len({r['stamp'] for r in rows}) < 2:
        raise ValueError('FIT musí obsahovat alespoň dva záznamy aktivity s platným časem; samotná plánovaná trasa nestačí.')
    return rows
