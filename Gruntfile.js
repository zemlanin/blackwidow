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
    },

    clean: {
      views: ['public/**/*.html'],
      css: ['public/css/'],
    },

    browserify: {
      app: {
        files: {
          'public/js/main.js': [
            'src/js/main.js',
          ],
        },
      },
    },

    watch: {
      js: {
        files: ['src/js/**/*.js'],
        tasks: ['browserify:app'],
        options: {
          interrupt: true,
        },
      },
      css: {
        files: ['src/css/**/*'],
        tasks: ['clean:css', 'copy:css'],
        options: {
          interrupt: true,
        },
      },
      views: {
        files: ['src/views/**/*'],
        tasks: ['clean:views', 'copy:views'],
        options: {
          interrupt: true,
        },
      },
    },

    connect: {
      app: {
        options: {
          base: 'public',
          open: true,
        },
      }
    },

  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('default', ['clean', 'copy', 'browserify']);
  grunt.registerTask('serve', ['connect:app:keepalive']);
};
