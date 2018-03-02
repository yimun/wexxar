const helper = require('./helper');
const fs = require('fs-extra');
const glob = require('glob');

const CND_PREFIX = 'https://raw.githubusercontent.com/yimun/wexxar/master/dist-prod';

const generateRoutes = (dir) => {
  dir = dir || '.';
  const sourcesMap = new Map();
  const routesMap = new Map();
  let srcPath = helper.root('map.json');
  let currentTime = new Date().toUTCString();
  let hasChange = false;  
  if (fs.existsSync(srcPath)) {
    fs.readJsonSync(srcPath).forEach((node) => {
      sourcesMap.set(node.uri, node);
    });
  }
  let routePath = helper.rootNode(dir + '/routes.json');
  if (fs.existsSync(routePath)) {
    fs.readJsonSync(routePath).items.forEach((node) => {
      routesMap.set(node.uri, node);
    });
  }
  // console.log(sourcesMap);
  // console.log(routesMap);
  const newRoutes = [];
  sourcesMap.forEach((v, k) => {
    let p = helper.rootNode(dir + '/' + v.filename + '-*.js');
    let files = glob.sync(p);
    if (files.length != 1) {
      console.error('file not exists or conflict');
      return;
    }
    let node;
    let cndPath = CND_PREFIX + files[0].replace(helper.rootNode(dir), '');
    if (routesMap.has(k) && routesMap.get(k).remote_file === cndPath) {
      node = routesMap.get(k);
    } else {
      node = {
        deploy_time: currentTime,
        remote_file: cndPath,
        uri: k
      };
      hasChange = true;
    }
    newRoutes.push(node);
  });
  let data = {
    deploy_time: currentTime,
    items: newRoutes,
  };
  if (hasChange) {
    fs.writeFileSync(routePath, JSON.stringify(data, null, 2), (err) => {
      console.log(err);
    });
  }
};

// TODO use plugins 
generateRoutes('dist-prod');
module.exports = generateRoutes;