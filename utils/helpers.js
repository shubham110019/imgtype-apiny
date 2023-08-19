
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
  
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
    const i = Math.floor(Math.log(bytes) / Math.log(k));
  
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
  
  function checkAuthKey(req, res, next) {
    const authKey = req.headers['auth-key'];
  
    if (authKey !== 'RRbKJEwKnso6ltfXuQOzUk9SiEgK6dLKnT7IvGK') { 
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    next();
  }
  
  module.exports = { formatBytes, checkAuthKey };