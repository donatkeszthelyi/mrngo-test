const fs = require('fs');
const path = require('path');

// Read the JSON file
const dataPath = path.join(__dirname, 'database_template.json');
const jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Initialize SQL statements
let sqlStatements = [];

// Convert JSON to SQL
const convertToSQL = (data) => {
  data.categories.forEach((category) => {
    sqlStatements.push(
      `INSERT INTO categories (category_id, category_name) VALUES (${
        category.category_id
      }, '${category.category_name.replace(/'/g, "''")}');`
    );

    category.concepts.forEach((concept) => {
      sqlStatements.push(
        `INSERT INTO concepts (concept_id, concept_name, category_id) VALUES (${
          concept.concept_id
        }, '${concept.concept_name.replace(/'/g, "''")}', ${
          category.category_id
        });`
      );

      concept.answers.forEach((answer) => {
        sqlStatements.push(
          `INSERT INTO answers (answer_id, answer_text, concept_id) VALUES (${
            answer.answer_id
          }, '${answer.answer_text.replace(/'/g, "''")}', ${
            concept.concept_id
          });`
        );
      });
    });
  });
};

convertToSQL(jsonData);

// Write SQL statements to a file
const sqlFilePath = path.join(__dirname, 'data.sql');
fs.writeFileSync(sqlFilePath, sqlStatements.join('\n'), 'utf8');

console.log('SQL file created successfully:', sqlFilePath);
