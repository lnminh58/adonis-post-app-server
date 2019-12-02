const ipfsAPI = require('ipfs-http-client');
const fs = require('fs');
const { first } = require('lodash');
const Env = use('Env');

const ipfsGateway = Env.get('IPFS_GATEWAY', 'ipfs.infura.io');
const ipfsPort = Env.get('IPFS_PORT', '5001');
const ipfsProtocol = Env.get('IPFS_PROTOCOL', 'https');

const ipfs = ipfsAPI(ipfsGateway, ipfsPort, { protocol: ipfsProtocol });

const readFileAsync = (path) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (error, data) => {
      if (error) reject(error);
      else resolve(data);
    });
  });
};

const deleteFileAsync = (path) => {
  return new Promise((resolve, reject) => {
    fs.unlink(path, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
};

class Storage {
  static async addFile(path) {
    // const file = await readFileAsync(path);
    // const buffer = Buffer.from(file);
    const res = await ipfs.addFromFs(path);
    const { hash } = first(res);
    await deleteFileAsync(path);
    return `${ipfsProtocol}://${ipfsGateway}/ipfs/${hash}`;
  }
}

module.exports = Storage;
