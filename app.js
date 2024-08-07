import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Convert the module URL to a file path and get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Set EJS as the view engine and specify the views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configure Multer for handling file uploads
const storage = multer.diskStorage({
    // Define the destination where files will be stored
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'file_storage'));
    },
    // Define the filename to use for the uploaded file
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// Create an instance of Multer with the storage configuration
const upload = multer({ storage });

// Serve static files from the 'file_storage' directory
app.use('/uploads', express.static(path.join(__dirname, 'file_storage')));

// Render the 'index.ejs' view for the root route
app.get('/', (req, res) => {
    res.render('index.ejs');
});

// Handle file uploads via POST request to '/upload'
app.post('/upload', upload.single('file'), (req, res) => {
    // Redirect to the root route after successful upload
    res.redirect('/');
});

// Handle file deletion via DELETE request to '/delete/:fileName'
app.delete('/delete/:fileName', async (req, res) => {
    const fileName = req.params.fileName;
    const filePath = path.join(__dirname, 'file_storage', fileName);

    try {
        // Asynchronously delete the file from the filesystem
        await fs.promises.unlink(filePath);
        res.send(`File "${fileName}" has been deleted.`);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // Handle case where the file does not exist
            res.status(404).send(`File "${fileName}" not found.`);
        } else {
            // Handle other potential errors
            res.status(500).send('An error occurred while deleting the file.');
        }
    }
});

// Handle viewing of uploaded files via GET request to '/view'
app.get('/view', async (req, res) => {
    const uploadDirectory = path.join(__dirname, 'file_storage');

    try {
        // Read the contents of the upload directory
        const files = await fs.promises.readdir(uploadDirectory);
        res.json({ files });
    } catch (err) {
        // Handle errors reading the directory
        console.error(err);
        res.status(500).send('Error reading the upload directory.');
    }
});

// Start the Express server on the specified port
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

/** Pejelasan supaya ingat: 
 * Paket multer adalah middleware untuk menangani multipart/form data, 
 * yang digunakan untuk mengunggah file dalam aplikasi web. 
 * Paket ini biasanya digunakan bersama dengan Express.js untuk mengelola pengunggahan file dalam aplikasi Node.js.
 */