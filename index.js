const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

const ADMIN = "8801410508042@c.us"; // তোমার নাম্বার (country code সহ)

const client = new Client({
    authStrategy: new LocalAuth()
});

// QR
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Namaz Bot Ready ✅');
});

// database
let data = {};
if (fs.existsSync('data.json')) {
    data = JSON.parse(fs.readFileSync('data.json'));
}

// listener
client.on('message', async message => {

    // শুধু এডমিন পারবে
    if (message.from !== ADMIN) return;

    if (!message.body.startsWith("/add")) return;

    let lines = message.body.split("\n");

    let name = lines[1].split(":")[1].trim();
    let fajr = lines[2].includes("yes");
    let zuhr = lines[3].includes("yes");
    let asr = lines[4].includes("yes");
    let maghrib = lines[5].includes("yes");
    let isha = lines[6].includes("yes");

    let prayers = [
        ["ফজর", fajr],
        ["যোহর", zuhr],
        ["আসর", asr],
        ["মাগরিব", maghrib],
        ["এশা", isha],
    ];

    let points = prayers.filter(p=>p[1]).length * 10;

    if (!data[name]) data[name] = 0;
    data[name] += points;

    fs.writeFileSync('data.json', JSON.stringify(data,null,2));

    let report = prayers.map(p=>`${p[0]} ${p[1] ? "✔️" : "❌"}`).join("\n");

    let msg = `🕌 *আজকের নামাজ রিপোর্ট*

👤 *${name}*

${report}

⭐ *আজকের পয়েন্ট:* ${points}
📊 *মোট পয়েন্ট:* ${data[name]}

_ما شاء الله 🤍_`;

    await message.reply(msg);
});

client.initialize();
