const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ✅ Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

const LOG_DIR = '/mnt/data/scan_logs';
// Create the scan_logs folder inside /mnt/data if it doesn't exist
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
const VALID_ASSEMBLERS = ['assembler1', 'assembler2', 'assembler3', 'assembler4', 'assembler5', 'assembler6'];

// Create CSV file if not exists
function initCSVFile(assembler) {
  const filePath = path.join(LOG_DIR, `${assembler}.csv`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, 'Cabinet Barcode,Order Number Barcode,Timestamp\n');
  }
  return filePath;
}

app.post('/submit-scan/:assembler', (req, res) => {
  const assembler = req.params.assembler.toLowerCase();
  const { cabinet, order, timestamp } = req.body;

  console.log("📥 Scan received for:", assembler, cabinet, order, timestamp);

  if (!cabinet || !order || !timestamp) {
    return res.status(400).send('Missing required fields.');
  }

  const filePath = initCSVFile(assembler);
  const line = `"${cabinet}","${order}","${timestamp}"\n`;

  fs.appendFile(filePath, line, (err) => {
    if (err) {
      console.error('CSV write error:', err);
      return res.status(500).send('Failed to save scan.');
    }
    res.status(200).send('Scan saved.');
  });
});

app.get('/', (req, res) => {
  res.send("📦 Barcode Scanner Backend is Live");
});

app.get('/download/:assembler', (req, res) => {
  const assembler = req.params.assembler.toLowerCase();
  if (!VALID_ASSEMBLERS.includes(assembler)) {
    return res.status(400).send('Invalid assembler name.');
  }

  const filePath = path.join(LOG_DIR, `${assembler}.csv`);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('No data found for this assembler.');
  }

  res.download(filePath);
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});
