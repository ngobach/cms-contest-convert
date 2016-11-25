const
    through = require('through2'),
    gulpUtil = require('gulp-util'),
    path = require('path'),
    yaml = require('js-yaml');

const config = require('./src/config.json');
/**
 * @param name Contest name
 */
module.exports = () => {

    let tasks = [];
    const contest_name = config.name;
    const root = path.join(__dirname, contest_name);
    let pdfFile;

    return through.obj(function (file, enc, cb) {
        if (file.isNull()){
            return cb(file);
        }
        if (file.isBuffer()) {
            if (path.basename(file.path) == 'contest.pdf') {
                // Contest file
                pdfFile = file.clone();
            } else if (path.extname(file.path) == '.inp' || path.extname(file.path) == '.out'){
                const task = path.basename(file.path, path.extname(file.path));
                if (tasks.indexOf(task)<0) tasks.push(task);
                const newFile = new gulpUtil.File({
                    cwd: __dirname,
                    base: __dirname,
                    path: file.path.endsWith('.inp')?path.join(root, task, 'input/input0.txt'):path.join(root, task, 'output/output0.txt'),
                    contents: file.contents
                });
                this.push(newFile);
            } else {
                gulpUtil.log(gulpUtil.colors.yellow(`Unknow file ${file.path}`));
            }
        } else {
            this.push(file);
        }
        cb();
    }, function (cb) {
        if (!pdfFile) {
            throw new Error("No pdf file!");
        }
        // Copy pdf files
        for (t of tasks) {
            this.push(new gulpUtil.File({
                cwd: __dirname,
                base: __dirname,
                path: path.join(root, t, 'testo/testo.pdf'),
                contents: pdfFile.contents
            }));
        }

        // Write main contest.yaml
        let contents;
        contents = yaml.dump({
            name: contest_name,
            description: contest_name,
            tasks: tasks,
            users: config.users.map(x => { return {username: x[0], password: x[1]}}),
            token_mode: 'infinite'
        });
        this.push(new gulpUtil.File({
            cwd: __dirname,
            base: __dirname,
            path: path.join(root, 'contest.yaml'),
            contents: new Buffer(contents)
        }));
        tasks.forEach(t => {
            contents = yaml.dump({
                name: t,
                title: 'Problem ' + t,
                time_limit: 1,
                memory_limit: 256,
                n_input: 1,
                public_testcases: '0',
                infile: '',
                outfile: '',
                token_mode: 'infinite'
            });
            this.push(new gulpUtil.File({
                cwd: __dirname,
                base: __dirname,
                path: path.join(root, t + '.yaml'),
                contents: new Buffer(contents)
            }));
        });
        cb();
    });
}