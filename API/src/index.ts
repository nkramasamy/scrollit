import express from 'express';

const NodeCache = require( "node-cache" );
const myCache = new NodeCache();

const port=process.env.PORT || 8000

const app = express();


app.get('/scrollposition/:url', (req, res) => {
    res.send(myCache.get(req.params.url));
});

app.post('/updatescrollposition/:url/:position', (req, res) => {
    myCache.set( req.params.url, req.params.position, 100000 );
    res.send(req.params.url);
});

app.listen(port, () => {
    console.log('The application is listening on port 8000!');
});