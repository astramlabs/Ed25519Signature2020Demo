import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import { verifyCredential } from './lib/validate';
import { VerifiableCredential } from './types/credential';

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.text());

// POST /api/verify endpoint
app.post('/api/verify', async (req: Request, res: Response) => {
  let credential: VerifiableCredential;
  
  if (typeof req.body === 'string') {
    try {
      credential = JSON.parse(req.body);
    } catch (error) {
      return res.status(400).json({ status: 'Invalid JSON in request body' });
    }
  } else {
    credential = req.body;
  }

  try {
    console.log(credential);
    const result = await verifyCredential(credential);
    res.status(200).json({ result });
  } catch (error) {
    res.status(500).json({ status: 'Error verifying credential', error: (error as Error).message });
  }
});

// Handle invalid routes
app.use((req: Request, res: Response) => {
  res.status(404).json({ status: 'Not Found' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});