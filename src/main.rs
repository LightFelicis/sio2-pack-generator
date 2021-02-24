#![feature(proc_macro_hygiene, decl_macro)]
#[macro_use]
extern crate rocket;
use rocket_contrib::json::Json;
use rocket_contrib::serve::StaticFiles;
use rocket_contrib::templates::Template;
use std::collections::HashMap;

mod package_creator;
use package_creator::{create, Task};
use tera::Context;
use serde::Serialize;


#[get("/")]
fn index() -> Template {
    let mut context = Context::new();
    Template::render("index", context.into_json())
}

#[post("/task", format = "application/json", data = "<task>")]
fn create_task(task: Json<Task>) -> () {
    let r = create(task).unwrap();
}

fn main() {
    rocket::ignite()
        .attach(Template::fairing())
        .mount("/", routes![index, create_task])
        .mount("/static", StaticFiles::from("static"))
        .launch();
}
