extern crate tempdir;
use std::io::{self};
use tempdir::TempDir;

use std::io::prelude::*;
use std::io::{Seek, Write};
use std::iter::Iterator;
use zip::result::ZipError;
use zip::write::FileOptions;

use std::fs::File;
use std::path::Path;
use walkdir::{DirEntry, WalkDir};

use rocket_contrib::json::Json;
use serde::{Serialize, Deserialize};

#[derive(Deserialize)]
pub struct Test {
    input: String,
    output: String
}

#[derive(Deserialize)]
pub struct Task {
    task_statement: String,
    exemplary_test: Test,
    tests: Vec<Test>
}

// Given task data from form, creates package
pub fn create(task : Json<Task>) -> zip::result::ZipResult<()> {
    let tmp_dir = TempDir::new("package")?;
    let file_path = tmp_dir.path().join("my-temporary-note.txt");
    let mut tmp_file = File::create(file_path)?;
    writeln!(tmp_file, "Brian was here. Briefly.")?;
    // TODO: create tests, doc dirs
    println!(";______;");
    let res = zip_package(tmp_dir.path().to_str().unwrap(),
                          "/tmp/paczka.zip");
    eprintln!("Koniec zip_package result.err() = {:?}", res.err());

    // By closing the `TempDir` explicitly, we can check that it has
    // been deleted successfully. If we don't close it explicitly,
    // the directory will still be deleted when `tmp_dir` goes out
    // of scope, but we won't know whether deleting the directory
    // succeeded.
    drop(tmp_file);
    tmp_dir.close()?;
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

pub fn zip_package(src_dir : &str, dst_dir : &str) -> zip::result::ZipResult<()> {
    println!("src_dir = {}", src_dir);
    if !Path::new(src_dir).is_dir() {
        return Err(ZipError::FileNotFound);
    }
    let path = Path::new(dst_dir);
    println!("dst_dir = {}", path.to_str().unwrap());
    let file = File::create(&path).unwrap();
    let walkdir = WalkDir::new(src_dir.to_string());
    let it = walkdir.into_iter();
    zip_dir(&mut it.filter_map(|e| e.ok()), src_dir, file,
            Some(zip::CompressionMethod::Bzip2).unwrap())?;
    Ok(())
}