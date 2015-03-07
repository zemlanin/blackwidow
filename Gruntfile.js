/*eslint strict:0*/

module.exports = function(grunt) {
  grunt.initConfig({
    // pkg: grunt.file.readJSON('package.json'),

    copy: {
      views: {
        expand: true,
        cwd: 'src/views/',
        src: '**/*.html',
        dest: 'public/',
      },
      css: {
        expand: true,
        cwd: 'src/css/',
        src: '**/*.css',
        dest: 'public/css/',
      },
      bitballoon: {
        src: '_redirects',
        dest: 'public/_redirects',
      },
    },

    clean: {
      views: ['public/**/*.html'],
      css: ['public/css/'],
    },

    watch: {
      css: {
        files: ['src/css/**/*'],
        tasks: ['clean:css', 'copy:css'],
      },
      views: {
        files: ['src/views/**/*'],
        tasks: ['clean:views', 'copy:views'],
      },
    },

    connect: {
      app: {
        options: {
          base: 'public',
          open: true,
          port: 8001,
        },
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('default', ['clean', 'copy']);
  grunt.registerTask('build', ['clean', 'copy']);
  grunt.registerTask('serve', ['connect:app:keepalive']);
};
