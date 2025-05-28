const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const LOG_DIR = path.join(__dirname, 'scan_logs');
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR);

const VALID_ASSEMBLERS = ['assembler1', 'assembler2', 'assembler3', 'assembler4', 'assembler5'];

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

  console.log("Received scan:", { assembler, cabinet, order, timestamp });

  }

  const { cabinet, order, timestamp } = req.body;
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
// Download CSV file for an assembler
app.get('/download/:assembler', (req, res) => {
  const assembler = req.params.assembler.toLowerCase();
  if (!VALID_ASSEMBLERS.includes(assembler)) {
    return res.status(400).send('Invalid assembler name.');
  }

  const filePath = path.join(LOG_DIR, `${assembler}.csv`);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('No data found for this assembler.');
  }

  res.download(filePath); // Triggers browser download
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});
