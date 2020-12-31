#![feature(proc_macro_hygiene, decl_macro)]
#[macro_use] extern crate rocket;
use std::collections::HashMap;
use rocket_contrib::templates::Template;
use rocket_contrib::serve::StaticFiles;
use rocket::Response;
use rocket::request::Form;
use rocket_contrib::json::Json;
use serde::{Serialize, Deserialize};

mod package_creator;
use package_creator::{create, Task};

#[get("/")]
fn index() -> Template {
    let context: HashMap<&str, &str> = HashMap::new();
    Template::render("index", &context)
}

#[post("/task", format = "application/json", data="<task>")]
fn create_task(task: Json<Task>) -> () {
    create(task);
}

fn main() {
    rocket::ignite()
        .mount("/", routes![index,create_task])
        .mount("/static", StaticFiles::from("static"))
        .attach(Template::fairing())
        .launch();
}
