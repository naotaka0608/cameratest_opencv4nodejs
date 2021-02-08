const conv = num => {
    let b = new ArrayBuffer(4);
    new DataView(b).setUint32(0, num);
    return Array.from(new Uint8Array(b));
  }
  
  console.log(conv(16));
  console.log(conv(255));
  console.log(conv(256));
  console.log(conv(640));
  console.log(conv(32768));

  let b1 = new ArrayBuffer(4);

  b1 = conv(1281);
  console.log(b1);

const buf = Buffer.alloc(4, 0, "ascii");

const buf2 = Buffer.alloc(4, 0, "hex");

buf[0] = 256;


console.log(buf)

function concatTypedArrays(a, b) { // a, b TypedArray of same type
  var c = new (a.constructor)(a.length + b.length);
  c.set(a, 0);
  c.set(b, a.length);
  return c;
}

var a = new Uint8Array(2),
    b = new Uint8Array(3);
a[0] = 1; a[1] = 2;
b[0] = 3; b[1] = 4;

var d = new Uint8Array(5);

d = concatTypedArrays(a, b); // [1, 2, 3, 4, 0] Uint8Array length 5
console.log(d);

