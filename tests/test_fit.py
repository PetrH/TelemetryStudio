"""Synthetic FIT fixtures: no user activity data is stored in this repository."""
import datetime
import pathlib
import struct
import sys
import unittest
from types import SimpleNamespace
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))
from fit_import import parse_fit, record_to_row


def crc(data):
    result = 0
    for byte in data:
        result ^= byte
        for _ in range(8):
            result = (result >> 1) ^ (0xA001 if result & 1 else 0)
    return result


def wrap(data):
    header = struct.pack('<BBHI4s', 12, 0x20, 2100, len(data), b'.FIT')
    body = header + data
    return body + struct.pack('<H', crc(body))


def definition(fields, endian='<', local=0):
    return bytes([0x40 | local, 0, int(endian == '>')]) + struct.pack(endian+'H', 20) + bytes([len(fields)]) + bytes(v for field in fields for v in field)


def fixture(endian='<', enhanced=True):
    fields = [(253,4,0x86),(0,4,0x85),(1,4,0x85),(3,1,2),(4,1,2),(7,2,0x84),(5,4,0x86)]
    fields += [(73,4,0x86),(78,4,0x86)] if enhanced else [(6,2,0x84),(2,2,0x84)]
    data = definition(fields,endian)
    for i in range(2):
        values = (1100000000+i, int(50*2**31/180), int(14*2**31/180), 120, 0 if i==0 else 85, 0 if i==0 else 220, i*1000, 10000, 3750)
        data += b'\0' + struct.pack(endian+'IiiBBHI'+('II' if enhanced else 'HH'), *values)
    return wrap(data)


class FitTests(unittest.TestCase):
    def test_units_endian_and_zeros(self):
        for endian in ('<','>'):
            for enhanced in (True,False):
                rows=parse_fit(fixture(endian,enhanced))
                self.assertEqual(len(rows),2)
                self.assertAlmostEqual(rows[0]['lat'],50,places=6)
                self.assertEqual(rows[0]['speed'],36)
                self.assertEqual(rows[0]['altitude'],250)
                self.assertEqual(rows[0]['power'],0)
                self.assertEqual(rows[0]['cadence'],0)
                self.assertEqual(rows[1]['power'],220)
                self.assertEqual(rows[1]['distance'],10)
                self.assertEqual(rows[1]['stamp']-rows[0]['stamp'],1000)
                self.assertIsNone(rows[0]['active'])

    def test_compressed_timestamp_and_missing(self):
        fields=[(253,4,0x86),(3,1,2)]
        stamp=1100000000
        data=definition(fields)+b'\0'+struct.pack('<IB',stamp,120)
        data+=definition([(3,1,2)],local=1)+bytes([0x80 | 0x20 | ((stamp+1)&31), 0xff])
        rows=parse_fit(wrap(data))
        self.assertEqual(rows[1]['stamp']-rows[0]['stamp'],1000)
        self.assertIsNone(rows[1]['hr'])
        self.assertIsNone(rows[1]['power'])
        self.assertIsNone(rows[1]['lat'])

    def test_corrupt_truncated_and_empty(self):
        good=fixture()
        broken=bytearray(good);broken[-1]^=1
        for data in (b'',b'not FIT',good[:-1],bytes(broken),wrap(b'')):
            with self.assertRaises(ValueError):parse_fit(data)

    def test_cadence_milliseconds_and_fallbacks(self):
        stamp=datetime.datetime(2026,1,1,tzinfo=datetime.timezone.utc)
        def row(**data):
            data={'timestamp':stamp,**data}
            return record_to_row(SimpleNamespace(fields=[SimpleNamespace(name=k,value=v) for k,v in data.items()]))
        r=row(timestamp_ms=stamp.timestamp()*1000+135,total_time=10.3,enhanced_speed=0,speed=5,enhanced_altitude=None,altitude=220)
        self.assertEqual(r['stamp'],stamp.timestamp()*1000+135)
        self.assertEqual(r['active'],10.3)
        self.assertEqual(r['speed'],0)
        self.assertEqual(r['altitude'],220)
        self.assertEqual(row(timestamp_ms=135)['stamp'],stamp.timestamp()*1000)

if __name__=='__main__':unittest.main()
