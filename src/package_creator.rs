extern crate tempdir;
use std::io::{self, BufReader};
use tempdir::TempDir;

use std::io::prelude::*;
use std::io::{Seek, Write};
use std::iter::Iterator;
use zip::result::ZipError;
use zip::write::FileOptions;

use std::fs::{File, create_dir, copy};
use std::path::Path;
use walkdir::{DirEntry, WalkDir};

use rocket_contrib::json::Json;
use serde::{Serialize, Deserialize};
use std::ops::Add;

#[derive(Deserialize)]
pub struct Test {
    input: String,
    output: String
}

#[derive(Deserialize)]
pub struct Task {
    tag: String,
    title: String,
    task_statement: String,
    exemplary_test: Test,
    tests: Vec<Test>
}

// Given task data from form, creates package
pub fn create(task : Json<Task>) -> zip::result::ZipResult<()> {
    let tmp_dir = TempDir::new(task.tag.as_str())?;
    prepare_directories(&tmp_dir, &task)?;
    prepare_tests(&tmp_dir, &task)?;
    let res = zip_package(tmp_dir.path().to_str().unwrap(),
                          &format!("/tmp/{}.zip", task.tag.as_str()));
    eprintln!("Finished zip_package result.err() = {:?}", res.err());
    Ok(())
}

fn prepare_directories(tmp_dir_path : &TempDir, task : &Json<Task>) -> io::Result<()> {
    create_dir(tmp_dir_path.path().join("doc"))?;
    create_dir(tmp_dir_path.path().join("in"))?;
    create_dir(tmp_dir_path.path().join("out"))?;
    create_dir(tmp_dir_path.path().join("prog"))?;
    prepare_makefile(tmp_dir_path.path(), &task.tag)?;
    prepare_config(tmp_dir_path.path(), task)?;
    Ok(())
}

fn prepare_makefile(tmp_dir_path : &Path, task_tag : &str) -> io::Result<()> {
    let makefile_in_path = tmp_dir_path.join("makefile.in");
    std::fs::write(makefile_in_path.as_path(),
                   std::fs::read_to_string("./resources/makefile.in.example")
                       .unwrap()
                       .replace("tag_placeholder", task_tag))
}

fn prepare_config(tmp_dir_path : &Path, task : &Json<Task>) -> io::Result<()> {
    let config_path = tmp_dir_path.join("config.yml");
    println!("config_path = {:?}", config_path);
    let tests_config = prepare_tests_config(task.tests.len() as i64);
    std::fs::write(config_path.as_path(),
                   std::fs::read_to_string("./resources/config.yml.example")
                       .unwrap()
                       .replace("task_title_placeholder", &task.title)
                       .add(&*tests_config))
}

fn prepare_tests_config(tests_num : i64) -> String {
    let mut res: String = String::from("");
    let normalized_tests = tests_num / 100;
    let last_test_points = 100 - ((tests_num - 1) * normalized_tests);
    for i in 1..tests_num {
        res += &format!("{}: {}\n", i, normalized_tests);
    }
    res += &format!("{}: {}\n", tests_num, last_test_points);
    res
}

fn prepare_tests(tmp_dir_path : &TempDir, task : &Json<Task>) -> io::Result<()> {
    create_test(tmp_dir_path, 0,
                &task.exemplary_test.input, &task.exemplary_test.output,&task.tag)?;
    for (i, test) in task.tests.iter().enumerate() {
        create_test(tmp_dir_path, (i + 1) as i32,
                    &test.input, &test.output, &task.tag)?;
    }
    Ok(())
}

fn create_test(tmp_dir_path : &TempDir, task_num : i32, input : &str, output : &str, task_tag : &str) -> io::Result<()> {
    let in_path = tmp_dir_path.path().join(format!("in/{}{}.in", task_tag, task_num));
    let out_path = tmp_dir_path.path().join(format!("out/{}{}.out", task_tag, task_num));
    std::fs::write(in_path.as_path(), input)?;
    std::fs::write(out_path.as_path(), output)?;
    Ok(())
}

#[cfg(feature = "bzip2")]
const METHOD_BZIP2: Option<zip::CompressionMethod> = Some(zip::CompressionMethod::Bzip2);

// From https://github.com/zip-rs/zip/blob/master/examples/write_dir.rs
fn zip_dir<T>(
    it: &mut dyn Iterator<Item = DirEntry>,
    prefix: &str,
    writer: T,
    method: zip::CompressionMethod,
) -> zip::result::ZipResult<()>
    where
        T: Write + Seek,
{
    let mut zip = zip::ZipWriter::new(writer);
    let options = FileOptions::default()
        .compression_method(method)
        .unix_permissions(0o755);

    let mut buffer = Vec::new();
    for entry in it {
        let path = entry.path();
        let name = path.strip_prefix(Path::new(prefix)).unwrap();

        // Write file or directory explicitly
        // Some unzip tools unzip files with directory paths correctly, some do not!
        if path.is_file() {
            println!("adding file {:?} as {:?} ...", path, name);
            #[allow(deprecated)]
                zip.start_file_from_path(name, options)?;
            let mut f = File::open(path)?;

            f.read_to_end(&mut buffer)?;
            zip.write_all(&*buffer)?;
            buffer.clear();
        } else if name.as_os_str().len() != 0 {
            // Only if not root! Avoids path spec / warning
            // and mapname conversion failed error on unzip
            println!("adding dir {:?} as {:?} ...", path, name);
            #[allow(deprecated)]
                zip.add_directory_from_path(name, options)?;
        }
    }
    zip.finish()?;
    Result::Ok(())
}

fn zip_package(src_dir : &str, dst_dir : &str) -> zip::result::ZipResult<()> {
    eprintln!("src_dir = {}", src_dir);
    if !Path::new(src_dir).is_dir() {
        return Err(ZipError::FileNotFound);
    }
    let path = Path::new(dst_dir);
    eprintln!("dst_dir = {:?}", path);
    let file = File::create(&path).unwrap();
    let walkdir = WalkDir::new(src_dir.to_string());
    let it = walkdir.into_iter();
    zip_dir(&mut it.filter_map(|e| e.ok()), src_dir, file,
            Some(zip::CompressionMethod::Bzip2).unwrap())?;
    Ok(())
}