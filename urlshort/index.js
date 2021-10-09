const http = require("http");
const dns = require("dns");
const server = http.createServer();
let storedUrl = [];
var shortUrl = require('node-url-shortener');

let getId = ( urll ) =>{
    shortUrl.short( urll, function(err, url){ console.log(url); let id = url; });
    // let id = url;
    let check = storedUrl.find((value)=>{ return value.id === id; });
    if( check === undefined){
        return id;
    }
    else{
        return getId();
    }
}

server.on("request", (req, res) => {
	if (req.url === "/shorten" && req.method === "POST") {
		let body = "";
		req.on("data", (chunk) => {
			body += chunk.toString("utf-8");
		});
		res.setHeader("Content-Type", "application/json");
		req.on("end", () => {
			let originalUrl;
			try {
				const requestJson = JSON.parse(body);                
				if ( "URL" in requestJson) {
					originalUrl = new URL(requestJson.URL);
                    const URLExists = storedUrl.find((value)=>{
                        return value.OriginalUrl === originalUrl.toString();
                    });

                    if (URLExists === undefined){
                        dns.lookup(originalUrl.hostname, (error) => {
                            if (error && error.code === "ENOTFOUND") {
                                res.statusCode = 404;
                                res.end(JSON.stringify({ error: "Invalid URL" }));
                            }
                        });
                        serverUrl = new URL("http://localhost:3000");
                        const id = getId( originalUrl );
                        serverUrl.pathname = id;                        
                        jsondata = {
                            id: id,
                            OriginalUrl: originalUrl.toString(),
                            ShortUrl: serverUrl.toString(),
                        };
                        storedUrl.push(jsondata);
                        res.end(JSON.stringify(jsondata));
                    }
                    else{
                        res.end(JSON.stringify(URLExists));
                    }
				}
			} catch (err) {
				res.statusCode = 404;
				res.end(JSON.stringify({ error: "Invalid Input data" }));
			}
		});
	} else if (req.url.slice(0,1)  === "/" && req.method === "GET") {
        const id = req.url.slice(1)
        const urlStored = storedUrl.find((value)=>{return value.id === id;});
        if( urlStored === undefined ){
            res.statusCode = 200;
            res.end(JSON.stringify({ Success: "Cant find specified URL." }));
        }
        else{
            res.writeHead(304, { location: urlStored.OriginalUrl });
            res.end();
        }       
	}
});

server.on("error", (error) => {
	console.error(error.message);
});

server.listen(3000);