module.exports = {
  dev: {
    script: 'app.js',
    options: {
      ignore: [
        'README.md',
        'node_modules/**',
        '.bower-cache/**',
        '.bower-registry/**',
        '.bower-tmp/**',
        'public/**',
        'grunt/**',
        'gruntfile.js',
        'test/**'
      ],
      watchedExtensions: ['js'],
      args: [],
      ext: 'js',
      nodeArgs: ['--debug'],
      delayTime: 1
    }
  }
};
