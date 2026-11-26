#!/usr/bin/env python3
"""Collect the datasets the guide's code cells open, and wrap each one as a small JS file the page can load.
usage: python3 make_data.py <data_root>"""
import sys, os, gzip, json, base64, struct, shutil
import numpy as np
R = sys.argv[1]
HERE = os.path.dirname(os.path.abspath(__file__))
D = os.path.join(HERE, 'datafiles'); S = os.path.join(HERE, 'site', 'data')
os.makedirs(D, exist_ok=True); os.makedirs(S, exist_ok=True)
ML = 'Machine Learning COM1011/'
src = {
 'week01_development.csv': ML + 'ML week 2/Workshop Week 2-20260930/week01_development.csv',
 'cars_dataset.csv': ML + 'ML week 3/Workshop Linear Regression-20261014/cars_dataset.csv',
 'marks.csv': ML + 'ML week 4/Workshop-20261014/marks.csv',
 'spam.csv': ML + 'ML week 5/Week 5 - Practical-20261019/spam.csv',
 'AmesHousing_full.csv': ML + 'Coursework/AmesHousing_full.csv',
 'words.txt': 'Programming/Data for programming/words.txt',
}
for name, rel in src.items():
    shutil.copy(os.path.join(R, rel), os.path.join(D, name))
# Fashion-MNIST: keep a balanced random sample (600 per class) in the same .gz format the coursework loader reads
with gzip.open(os.path.join(R, ML, 'Coursework/train-labels-idx1-ubyte.gz'), 'rb') as f:
    lab = np.frombuffer(f.read(), dtype=np.uint8, offset=8)
with gzip.open(os.path.join(R, ML, 'Coursework/train-images-idx3-ubyte.gz'), 'rb') as f:
    img = np.frombuffer(f.read(), dtype=np.uint8, offset=16).reshape(len(lab), 784)
rng = np.random.default_rng(1011)
PER = 600
idx = np.concatenate([rng.choice(np.where(lab == k)[0], PER, replace=False) for k in range(10)])
rng.shuffle(idx)
with gzip.open(os.path.join(D, 'train-labels-idx1-ubyte.gz'), 'wb', compresslevel=9) as f:
    f.write(struct.pack('>II', 2049, len(idx)) + lab[idx].tobytes())
with gzip.open(os.path.join(D, 'train-images-idx3-ubyte.gz'), 'wb', compresslevel=9) as f:
    f.write(struct.pack('>IIII', 2051, len(idx), 28, 28) + img[idx].tobytes())
TEXT = ('.csv', '.txt', '.json', '.py')
for name in sorted(os.listdir(D)):
    p = os.path.join(D, name)
    raw = open(p, 'rb').read()
    if name.endswith(TEXT):
        txt = raw.decode('utf-8', errors='replace')
        js = f'GUIDE.file({json.dumps(name)}, "text", {json.dumps(txt, ensure_ascii=False)});\n'
    else:
        js = f'GUIDE.file({json.dumps(name)}, "base64", "{base64.b64encode(raw).decode()}");\n'
    out = os.path.join(S, name + '.js')
    open(out, 'w', encoding='utf-8').write(js)
    print(f'{name:36s} {len(raw)/1024:8.0f} KB  ->  data/{name}.js {os.path.getsize(out)/1024:8.0f} KB')
