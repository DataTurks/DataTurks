import request from 'request';
import cache from 'memory-cache';

export default function cachedRequest(url) {
  return new Promise((resolve, reject) => {
    const cachedResponse = cache.get(url);

    if (cachedResponse) {
      resolve(cachedResponse);
    } else {
      request({
        url: url,
        json: true,
      }, (error, response, body) => {
        if (error) {
          reject(error);
        } else if (response.statusCode !== 200) {
          reject({'statusCode': response.statusCode});
        } else {
          cache.put(url, body, 60 * 1000);
          resolve(body);
        }
      });
    }
  });
}
