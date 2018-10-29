module.exports = {
    dist: {
        files: [
          {expand: true, dest: 'public/dist/', src:'**', cwd:'public/'},
          {expand: true, dest: 'public/dist/fonts/', src:'**', cwd:'public/js/components/font-awesome/fonts'},
          {expand: true, dest: 'public/dist/fonts/', src:'**', cwd:'public/js/components/bootstrap/fonts'},
          {expand: true, dest: 'public/dist/css/', src:'**', cwd:'public/fonts/simplelineicons'}
        ]
    }
};
