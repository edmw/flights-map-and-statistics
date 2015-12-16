
    Available tasks:

    check
      Runs a code style check of the javascript code.

    hint
      Runs a static code analysis of the javascript code.

    clean
      Deletes all artifacts from the Application folder.

    build:css
      Compiles and minifies (for release builds) the css files and
      copies the resulting files to the Application folder.

    build:application
      Bundles and minifies (for release builds) the javascript files and
      copies the resulting files to the Application folder.

    build
      Runs a complete build including analysing the applications code,
      copying the applications resources and compiling and bundling the
      application. The resulting files will be copied to the Application
      folder.

    watch
      Watches the javascript and css files for changes and triggers a
      rebuild for the changed parts.

    run
      Runs the application from the Application folder in a webbrowser
      after executing a complete build.

    release
      Runs a complete build with minification and copies the resulting
      files to the Application folder. Creates a zip archive of the
      application in the Releases folder.

    test
      Runs the tests for the application. Generates coverage report in
      the Reports folder.

    doc
      Generates API documentation in the Documentation folder.

