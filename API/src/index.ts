import express from 'express';

const port=process.env.PORT || 8000

const app = express();

app.get('/scrollposition/:url', (req, res) => {
    res.send(req.params.url);
});

app.post('/updatescrollposition/:url/:position', (req, res) => {
    res.send(req.params);
});

app.listen(port, () => {
    console.log('The application is listening on port 8000!');
});