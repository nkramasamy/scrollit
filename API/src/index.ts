import express from 'express';

const port=process.env.PORT || 8000

const app = express();

app.use((cli, res, next) => {
    res.setHeader('Allow', "*")
    res.setHeader('Connection', "keep-alive")
    res.setHeader("Date", Date())
    res.setHeader("Content-Type", "application/json; charset=utf-8")
    res.setHeader('Access-Control-Allow-Origin', "*")
    res.setHeader('Allow-Control-Allow-Methods', "*")
    res.setHeader('Access-Control-Allow-Headers', "Origin, X-Requested-With, Content-Type, Accept")
    next()
});

app.get('/scrollposition/:url', (req, res) => {
    res.send(req.params.url);
});

app.post('/updatescrollposition/:url/:position', (req, res) => {
    res.send(req.params);
});

app.listen(port, () => {
    console.log('The application is listening on port 8000!');
});