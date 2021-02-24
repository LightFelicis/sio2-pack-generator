#![feature(proc_macro_hygiene, decl_macro)]
#[macro_use]
extern crate rocket;
use rocket::response::NamedFile;
use rocket_contrib::json::Json;
use rocket_contrib::serve::StaticFiles;
use rocket_contrib::templates::Template;
use std::fs;

mod package_creator;
use package_creator::{create, Task};
use tera::Context;
use anyhow;


#[get("/")]
fn index() -> Template {
    let context = Context::new();
    Template::render("index", context.into_json())
}

#[post("/task", format = "application/json", data = "<task>")]
fn create_task(task: Json<Task>) -> Result<NamedFile, anyhow::Error> {
    let r = create(task)?;
    eprintln!("{:?}", r);
    let file = NamedFile::open(r.as_str())?;
    fs::remove_file( r.as_str())?;
    Ok(file)
}

fn main() {
    rocket::ignite()
        .attach(Template::fairing())
        .mount("/", routes![index, create_task])
        .mount("/static", StaticFiles::from("static"))
        .launch();
}
