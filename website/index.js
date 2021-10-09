const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const server = http.createServer();

server.on( 'request', ( req, res ) => {
  if ( req.url === '/' ) {
    const rs = fs.createReadStream( path.join( __dirname, 'index.html' ));
    rs.on( 'error', ( error ) => {
        console.log( error.message );
        return;
    });
    rs.pipe( res );
  } else if ( req.url === '/contact' ) {
    const rs = fs.createReadStream( path.join( __dirname, 'contact.html' ));
    rs.on( 'error', ( error ) => {
        console.log( error.message );
        return;
    });
    rs.pipe( res );
  } else if ( req.method === 'POST' && req.url === '/message' ) {
    // res.setHeader("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS" );
    let messageBody = '';
    req.on( 'data', ( chunk ) => {
        console.log('chunk',chunk.toString());
        messageBody += chunk.toString();
    });
    let jsonData = {};

    req.on( 'end', () => {
      let messageElement = messageBody.split( '&' );

      messageElement.map(( value ) => {
        const elements = value.split( '=' );
        jsonData [ elements[ 0 ] ] = elements[ 1 ] ;
      });

      const ws = fs.createWriteStream( path.join( __dirname, 'message.json'), { flags: 'a' });

      ws.on( 'error', ( error ) => {
        console.log( error.message );
      });

      ws.write( JSON.stringify( jsonData, undefined, 2 ));
      ws.end();

      res.writeHead (301, { Location: '/' });
      res.end();
    });
  }
});

server.on( 'error', ( error ) => {
  console.error( error.message );
});

server.listen( 3000 );