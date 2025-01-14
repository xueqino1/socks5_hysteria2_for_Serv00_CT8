//新建secret GETCMLIUIP_JSON  {"dhost":"a.com","dport":12345}

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
if (process.argv.length < 3) {
    console.error('Usage: node index.js cfg.json');
    process.exit(1);
  }
const configFile = process.argv[2];
const configPath = path.resolve(__dirname, configFile);

if (!fs.existsSync(configPath)) {
console.error(`Configuration file ${configFile} not found.`);
process.exit(1);
}
try{
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log('Configuration loaded:', config);
}
catch(e){
    console.log('Configuration parse failed:', e);
}
// 定义要请求的 URL
const url="https://sub.cmliussss.workers.dev/sub?password=a&security=tls&alpn=h2%2Chttp%2F1.1%2Ch3&type=ws&host=a.com&path=%2F"
let dhost=config.dhost
let dport=config.dport
// 发送 HTTP GET 请求
https.get(url, (response) => {
    let data = '';

    // 当数据块到达时，将其添加到数据变量中
    response.on('data', (chunk) => {
        data += chunk;
    });

    // 当响应结束时，处理数据
    response.on('end', () => {
        try {
            // 解码 Base64 数据
            const decodedData = Buffer.from(data, 'base64').toString('utf-8');
            
            // 按行分割并逐行打印
            const lines = decodedData.split('\n');
            let postData=''
            lines.forEach((line,idx) => {
                console.log(line);
                //const serverPortMatch = line.match(/@([^:]+):(\d+)/); 遇到ipv6地址会出错
                const serverPortMatch = line.match(/@((?:[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9\-]+)*|\[[^\]]+\]):(\d+))/);
                

                const tagMatch = line.match(/#(.+)$/);
                  
                if(serverPortMatch && tagMatch){
                    //postData+=(idx==0?'':'\n')+ serverPortMatch[1].split(':')[0]+":"+serverPortMatch[2]+'#'+tagMatch[1] 
                    postData+=(idx==0?'':'\n')+ serverPortMatch[1]+'#'+tagMatch[1] 
                }
            });
            postData = `data=${encodeURIComponent(postData)}`;
            console.log("postData,",postData)

            const options = {
                hostname: dhost,
                port: dport,
                path: '/cfip.php',
                method: 'POST',
                headers: {
                    //'Content-Type': 'application/json', //需要发送json数据 postData = JSON.stringify({ data: lines });
                    'Content-Type': 'application/x-www-form-urlencoded', 
                    'Content-Length': Buffer.byteLength(postData)
                }
            };

            let data2 = '';
            const req = http.request(options, (res) => {
                console.log(`状态码: ${res.statusCode} `);
                res.on('data', (chunk) => {
                    //process.stdout.write(chunk);
                });
                res.on('data', (chunk) => {
                    data2 += chunk;
                });

                res.on('end', () => {
                    console.log(`响应内容: ${data2}`);
                });
            });
            

            
            req.on('error', (error) => {
                console.error('请求错误:', error);
            });

            // 写入请求体
            req.write(postData);
            req.end();
        } catch (error) {
            console.error('解码失败:', error);
        }
    });
}).on("error", (err) => {
    console.error("请求错误:", err.message);
});
