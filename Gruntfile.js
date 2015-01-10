module.exports = function(grunt) {
  var externalModules = ['react/addons', 'baconjs', 'firebase'];

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
        files: [
          {'public/js/client.js': ['src/js/client.js']},
          {'public/js/server.js': ['src/js/server.js']},
        ],
        options: {
          external: externalModules,
        },
      },
      core: {
        src: [],
        dest: 'public/js/core.js',
        options: {
          require: externalModules,
        },
      }
    },

    watch: {
      js: {
        files: ['src/js/**/*.js'],
        tasks: ['browserify:app'],
      },
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
        },
      }
    },

  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('default', ['clean', 'copy', 'browserify:app']);
  grunt.registerTask('build', ['clean', 'copy', 'browserify']);
  grunt.registerTask('serve', ['connect:app:keepalive']);
};
