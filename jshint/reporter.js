module.exports = {
    reporter: function reporter(results) {
        var len = results.length,
            str = '',
            file, error;

        results.forEach(function (result) {
            file = result.file;
            error = result.error;
            str += file  + ': line ' + error.line + ', col ' +
                error.character + ', ' + error.reason + '\n';
        });

        process.stdout.on('end', function () {
            process.exit(len > 0 ? 1 : 0);
        });

        process.stdout.write((len > 0 ? (str + "\n" + len + ' error' + ((len === 1) ? '' : 's')) : "Lint Free!") + "\n");
    }
};
