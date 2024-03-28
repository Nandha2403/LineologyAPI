// const express = require("express");
// const { google } = require("googleapis");
// const { Datastore } = require("@google-cloud/datastore");

// const app = express();
// const datastore = new Datastore({
//   projectId: "lineology-apis-413413",
//   databaseId: "tarotcardsdata",
// });

// // // Function to authenticate with Google Sheets API
// // async function authenticate() {
// //   const auth = new google.auth.GoogleAuth({
// //     // Your credentials here
// //     // You can also use environment variables to store these sensitive data
// //     keyFile: "./services.json",
// //     scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
// //   });
// //   return await auth.getClient();
// // }
// // Function to authenticate with Google Sheets API
// async function authenticate() {
//   const auth = new google.auth.GoogleAuth({
//     keyFile: "./services.json", // Your credentials here
//     scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
//   });
//   return await auth.getClient();
// }

// //

// // Function to fetch data from Google Sheets
// async function getSheetData(auth) {
//   const sheets = google.sheets({ version: "v4", auth });

//   const spreadsheetId = "12MJh62h_xE57sV4M5z76z6qkf8QL4yNQMqO0VnSF5fY"; // Replace with your spreadsheet ID
//   const range = "CopyOfTarotCards!A:C"; // Update with your sheet name and range

//   const response = await sheets.spreadsheets.values.get({
//     spreadsheetId,
//     range,
//   });

//   const rows = response.data.values;
//   // console.log(rows);
//   return rows;
// }

// // Function to transform Google Sheets data into Datastore entities
// function transformDataToEntities(sheetData) {
//   // Assuming your sheetData is an array of arrays where each inner array represents a row
//   // You can customize this function according to your sheet's structure
//   return sheetData.map((row) => {
//     return {
//       key: datastore.key("interpretations"), // Assuming "interpretations" is the kind in Datastore
//       data: {
//         // Assuming the structure of your Datastore entity
//         Cards: row[0],
//         LifeArea: row[1],
//         Interpretation: row[2],
//       },
//     };
//   });
// }

// //

// app.get("/addData", async (req, res) => {
//   // const query = datastore.createQuery("interpretations");

//   try {
//     // const [entities] = await datastore.runQuery(query);
//     // res.json(entities);
//     const authClient = await authenticate();
//     console.log("----------AuthClient---------");
//     console.log(authClient);
//     const sheetData = await getSheetData(authClient);
//     // console.log(sheetData);
//     const entities = transformDataToEntities(sheetData);
//     // console.log(entities);
//     // res.json(entities)
//     // const [savedEntities] = await datastore.save(entities);
//     // res.json(savedEntities);
//   } catch (err) {
//     console.error("Error fetching data:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// const Port = process.env.PORT || 8080;

// app.listen(Port, () => {
//   console.log(`App is running at Port no ${Port}`);
// });

const express = require("express");
const { google } = require("googleapis");
const { Datastore } = require("@google-cloud/datastore");

const app = express();

const datastore = new Datastore({
  projectId: "lineology-apis-413413",
  databaseId: "tarotcardsdata",
});

async function authenticate() {
  const auth = new google.auth.GoogleAuth({
    keyFile: "./services.json",
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  return await auth.getClient();
}

// Function to fetch all data from Google Sheets
async function getAllSheetData(auth) {
  const sheets = google.sheets({ version: "v4", auth });

  const spreadsheetId = "12MJh62h_xE57sV4M5z76z6qkf8QL4yNQMqO0VnSF5fY"; // Replace with your spreadsheet ID
  const range = "CopyCardsMeaning"; // No range specified to get all data

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  const rows = response.data.values;

  return rows;

  //   const rows = response.data.values;
  //     if (rows.length) {
  //       const headers = rows[0]; // Assuming first row contains headers
  //       // const jsonData = [];

  //       for (let i = 1; i < rows.length; i++) {
  //         const row = rows[i];
  //         const obj = {};

  //         for (let j = 0; j < headers.length; j++) {
  //           obj[headers[j]] = row[j];
  //         }

  //         // jsonData.push(obj);
  //         console.log(obj);
  //       }
  // }
}

// Function to transform Google Sheets data into Datastore entities
function transformDataToEntities(sheetData) {
  // Assuming your sheetData is an array of arrays where each inner array represents a row
  // You can customize this function according to your sheet's structure
  return sheetData.map((row) => {
    return {
      key: datastore.key("interpretations"), // Assuming "interpretations" is the kind in Datastore
      data: {
        // Assuming the structure of your Datastore entity
        Cards: row[0],
        LifeArea: row[1],
        Interpretation: row[2],
      },
    };
  });
}

// Route to fetch all data from Google Sheets
app.get("/addAllDataToDataStore", async (req, res) => {
  try {
    const authClient = await authenticate();
    const sheetData = await getAllSheetData(authClient);

    const entities = transformDataToEntities(sheetData);
    const [savedEntities] = await datastore.save(entities);
    res.json(savedEntities);
    // console.log(entities);

    // Log the fetched data for debugging
    // console.log("Fetched data:", sheetData);

    res.json(sheetData); // Send fetched data as response
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to fetch all data from Datastore
app.get("/getAllDataFromDataStore", async (req, res) => {
  const { Cards, LifeArea } = req.query;
 
  let query = datastore.createQuery("interpretations");

  if (Cards) {
    query = query.filter("Cards", "=", Cards);
  }
  if (LifeArea) {
    query = query.filter("LifeArea", "=", LifeArea);
  }

  try {
    const [entities] = await datastore.runQuery(query);
    res.json(entities);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const port = process.env.PORT || 8080; // Corrected port configuration

app.listen(port, () => {
  console.log(`App is running at Port no ${port}`);
});
