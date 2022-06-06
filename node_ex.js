const http = require('http');
const express = require('express')
var app = express();
const mysql = require('mysql2');
const { appendFile } = require('fs');
var { PythonShell } = require('python-shell');



// Create connection
var conn = mysql.createConnection({
    host: 'localhost', // Replace with your host name 
    user: 'User', // Replace with your database username
    password: '', // Replace with your database password 
    database: 'DB',
    port: "3306"
});
conn.connect(function(err) {
    if (err) throw err;
    console.log('Database is connected successfully !');
});

//python import

app.get('/data_export_Daily_Drilling_Report', DrillingReport1);

app.get('/data_export_Daily_Completions_Report', Daily_Completions_Report);

app.get('/data_export_Daily_Cost_Report', Daily_Cost_Report);

app.get('/data_export_Facilities_Report', Facilities_Report)

// done it imports the first two tables Well_info and Casing
function DrillingReport1(req, res) { //Anything with Daily Drilling
    console.log("Starting export of Drilling Report");
    PythonShell.run('Python_Scripts/Well_info.py', null, function(err, data) {
        globalThis.obj = data;
        console.log(data);
        globalThis.counter = 1
        if (data == 'Error: Invalid Report Title') {
            console.log("Error Wrong Report Title");
        }
        if (Object.keys(data).length == 0) {
            var newish = data
            var sql = `INSERT INTO Daily_Drilling_well_info VALUE ${newish};`
            conn.query(sql, err => {
                if (err) {
                    throw err
                }

            })
        } else {
            var newish = Array.from(data)[0]
            var sql = `INSERT INTO Daily_Drilling_well_info VALUE ${newish};`
            conn.query(sql, err => {
                if (err) {
                    2
                    throw err
                }

            })
            for (let step = 1; step < Object.keys(data).length; step++) {
                globalThis.counter += 1
                var newish = Array.from(data)[step]
                var sql = `INSERT INTO Daily_Drilling_casing VALUE ${newish};`
                conn.query(sql, err => {
                    if (err) {
                        throw err
                    }

                })

            }

        }

        res.send("Completed Export")
    })

}

function Daily_Completions_Report(req, res) { // Daily Comp
    console.log("Start Export Completions Report");
    PythonShell.run('Python_Scripts//Completion_Report_Info.py', null, function(err, Info) {
        globalThis.obj = Info;
        if (Info == 'Error: Invalid Report Title') {
            console.log("Error Wrong Report Title");
        }
        if (Info != null) {
            var newish = (Info)
            var sql = `INSERT INTO Completion_Report_Info VALUE ${newish};`
            conn.query(sql, err => {
                if (err) {
                    throw err
                }

            })
        }
    })
    PythonShell.run('Python_Scripts//Completion_Report_Casing.py', null, function(err, Casing) {
        globalThis.obj = Casing;
        if (Casing != null) {
            var newish = (Casing)
            var sql = `INSERT INTO Completion_Report_Casing VALUE ${newish};`
            conn.query(sql, err => {
                if (err) {
                    throw err
                }

            })
        }
    })
    res.send("Completed Export")
}



function Daily_Cost_Report(req, res) { //Costs
    console.log("Start Export Completions Report");
    PythonShell.run('Python_Scripts//D_Cost_Report.py', null, function(err, D_Cost_Report) {
        globalThis.obj = D_Cost_Report;
        if (D_Cost_Report == 'Error: Invalid Report Title') {
            console.log("Error Wrong Report Title");
        }
        if (D_Cost_Report != null) {
            var newish = (D_Cost_Report)
            var sql = `INSERT INTO Cost_Report_Info VALUE ${newish};`
            conn.query(sql, err => {
                if (err) {
                    throw err
                }

            })
        }
    })
    PythonShell.run('Python_Scripts//D_Cost_Intangible_Costs.py', null, function(err, Intangible_Costs) {
        globalThis.obj = Intangible_Costs;
        if (Intangible_Costs != null) {
            var newish = (Intangible_Costs)
            var sql = `INSERT INTO Cost_Report_Intangible_Costs VALUE ${newish};`
            conn.query(sql, err => {
                if (err) {
                    throw err
                }

            })
        }
    })

    res.send("Completed Export")

}

function Facilities_Report(req, res) { //(Injection Project)
    console.log("Start Export Facilities Report");
    PythonShell.run('Python_Scripts//Facilities_Report_Info.py', null, function(err, Report_Info) {
        globalThis.obj = Report_Info;
        if (Report_Info == 'Error: Invalid Report Title') {
            console.log("Error Wrong Report Title");
        }
        if (Report_Info != null) {
            var newish = (Report_Info)
            var sql = `INSERT INTO Facilities_Report_Info VALUE ${newish};`
            conn.query(sql, err => {
                if (err) {
                    throw err
                }

            })
        }
    })
    PythonShell.run('Python_Scripts//Facilities_Report_Daily_Activity.py', null, function(err, Daily_Activity) {
        globalThis.obj = Daily_Activity;
        if (Daily_Activity != null) {
            var newish = (Daily_Activity)
            var sql = `INSERT INTO Facilities_Report_Daily_Activity VALUE ${newish};`
            conn.query(sql, err => {
                if (err) {
                    throw err
                }

            })
        }
    })
    res.send("Completed Export")

}



app.get("/createdb", (req, res) => {
    let sql = "CREATE DATABASE FirstTable";
    conn.query(sql, (err) => {
        if (err) {
            throw err;
        }
        res.send("Database Created")
    });
});

//Create Table
app.get('/createstuff', (req, res) => {
    let sql = 'CREATE TABLE stuff(id int AUTO_INCREMENT, name VARCHAR(255), designsation VARCHAR(255), PRIMARY KEY(id));'
    conn.query(sql, err => {
        if (err) {
            throw err
        }
        res.send('Stuff table created')
    })
})


//insert 
app.get('/person1', (req, res) => {
    let post = { name: 'Jake Smith', designsation: 'Chief Executive Offiver' }
    let sql = 'INSERT INTO stuff SET ?;'
    let query = conn.query(sql, post, err => {
        if (err) {
            throw err
        }
        res.send('Person added')
    })
})

app.get('/getperson', (req, res) => {
    let sql = 'SELECT * FROM stuff'
    let query = conn.query(sql, (err, results) => {
        if (err) {
            throw err
        }
        console.log(results)
        res.send('Person details fetched')
    })
})

// update 
app.get('/updateperson/:id', (req, res) => {
    let newName = 'Updated name'
    let sql = `UPDATE stuff SET name = '${newName}' WHERE id = ${req.params.id}`
    let query = conn.query(sql, err => {
        if (err) {
            throw err
        }
        res.send('Employee updated')
    })
})

// delete 
app.get('/deletewell/:Well_Name', (req, res) => {
    let sql = `DELETE FROM test WHERE Well_Name = '${req.params['Well_Name']}'`
    let quer = conn.query(sql, err => {
        if (err) {
            throw err
        }
        res.send('Well deleted')
    })
})


app.listen(3000, () => console.log("app starts at port 3000"));