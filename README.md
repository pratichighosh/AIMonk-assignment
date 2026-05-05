# AIMonk Full Stack Assignment
## Nested Tags Tree — React + Django + SQLite

---

## Tech Stack

 Frontend   | React 18, Vite, Tailwind CSS        
 Backend    | Python 3.10+, Django 4.2, DRF       
 Database   | SQLite (built-in, zero config)      
 API Style  | REST (GET / POST / PUT / DELETE)    



## API Endpoints

| Method | URL                    | Description                        |
|--------|------------------------|------------------------------------|
| GET    | /api/trees/            | Return all saved tree hierarchies  |
| POST   | /api/trees/            | Save a new tree hierarchy          |
| GET    | /api/trees/<id>/       | Fetch a single tree by ID          |
| PUT    | /api/trees/<id>/       | Update an existing tree            |
| DELETE | /api/trees/<id>/       | Delete a tree                      |

POST / PUT request body:
```json
{
  "tree_data": {
    "name": "root",
    "children": [
      { "name": "child1", "data": "hello" }
    ]
  }
}
