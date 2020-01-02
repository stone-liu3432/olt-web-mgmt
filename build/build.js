"use strict";
require("./check-versions")();

process.env.NODE_ENV = "production";

const fs = require("fs");
const ora = require("ora");
const rm = require("rimraf");
const path = require("path");
const chalk = require("chalk");
const webpack = require("webpack");
const config = require("../config");
const webpackConfig = require("./webpack.prod.conf");

const autoSync = filename => {
    let filePath = "\\\\192.168.5.28\\HSGQ File Server\\鸿升研发\\WEB版本";
    // latest文件夹只存放最新一次的编译版本
    // backup存放所有的历史版本
    let files = fs.readdirSync(path.join(filePath, "latest"));
    files.forEach(filename => {
        var filedir = path.join(filePath, "latest", filename);
        const stats = fs.statSync(filedir);
        const isFile = stats.isFile();
        console.log(filename);
        if (isFile && filename.indexOf("dist") === 0) {
            fs.unlinkSync(filedir);
            console.log(`删除 ${chalk.green(filedir)} 成功 ！\n`);
        }
    });
    let data = fs.readFileSync(filename);
    const paths = ["latest", "backup"];
    paths.forEach(item => {
        fs.writeFile(
            path.join(
                filePath,
                item,
                filename.slice(filename.lastIndexOf("\\") + 1)
            ),
            data,
            function(err) {
                if (err) {
                    return console.error(err);
                }
                console.log(
                    chalk.yellow(
                        `压缩文件 ${chalk.green(
                            filename.slice(filename.lastIndexOf("\\") + 1)
                        )} 同步至${item}目录成功！\n`
                    )
                );
            }
        );
    });
};

const autoArchiver = () => {
    let archiver = require("archiver");
    console.time("文件压缩成功，共计用时：");
    // 创建文件输出流
    let filename =
        path.resolve(__dirname, "../dist/dist") + timeStramp() + ".zip";
    let output = fs.createWriteStream(filename);
    let archive = archiver("zip", {
        zlib: { level: 9 } // 设置压缩级别
    });
    // 文件输出流结束
    output.on("close", function() {
        console.timeEnd("文件压缩成功，共计用时：");
        console.log(
            chalk.green(`\n压缩后文件大小共 ${archive.pointer()} 字节 \n\n`)
        );
        autoSync(filename);
    });
    // 数据源是否耗尽
    output.on("end", function() {
        console.log("数据源已耗尽");
    });
    // 存档警告
    archive.on("warning", function(err) {
        if (err.code === "ENOENT") {
            console.warn("路径名中的目录不存在或是无效的符号连接");
        } else {
            throw err;
        }
    });
    // 存档出错
    archive.on("error", function(err) {
        throw err;
    });
    // 通过管道方法将输出流存档到文件
    archive.pipe(output);
    // 从流中附加文件
    let index = path.resolve(__dirname, "../dist/index.html");
    archive.append(fs.createReadStream(index), { name: "index.html" });
    // 从子目录追加文件并将其命名为“新子dir”在存档中
    archive.directory(path.resolve(__dirname, "../dist/static"), "static");
    // 完成归档
    archive.finalize();
};

function timeStramp() {
    var now = new Date();
    return `${now.getFullYear()}-${now.getMonth() +
        1}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}`;
}

const spinner = ora("building for production...");
spinner.start();

rm(path.join(config.build.assetsRoot, config.build.assetsSubDirectory), err => {
    if (err) throw err;
    webpack(webpackConfig, function(err, stats) {
        spinner.stop();
        if (err) throw err;
        process.stdout.write(
            stats.toString({
                colors: true,
                modules: false,
                children: false,
                chunks: false,
                chunkModules: false
            }) + "\n\n"
        );

        if (stats.hasErrors()) {
            console.log(chalk.red("  Build failed with errors.\n"));
            process.exit(1);
        }

        console.log(chalk.cyan("  Build complete.\n"));
        console.log(
            chalk.yellow(
                "  Tip: built files are meant to be served over an HTTP server.\n" +
                    "  Opening index.html over file:// won't work.\n"
            )
        );
        autoArchiver();
    });
});
