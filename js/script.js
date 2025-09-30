// Swimming Distribution Logic (converted from Rust)
class Swimmer {
    constructor(name, age, skill, duration) {
        this.name = name;
        this.age = age;
        this.skill = skill;
        this.duration = duration;
    }
}

function getInstruction(swimmer) {
    let instruction;
    
    switch (swimmer.skill) {
        case 8:
        case 9:
            instruction = swimmer.duration < 60 ? "сам" : "до дна и обратно";
            break;
        case 7:
            instruction = swimmer.duration < 55 ? "до дна" : "до дна и обратно";
            break;
        case 6:
            instruction = swimmer.duration < 55 ? "до глубины и обратно" : "3 нырка, до глубины и обратно";
            break;
        case 5:
            instruction = swimmer.duration < 55 ? "3 нырка, до глубины и обратно" : "2 нырка, до глубины и обратно";
            break;
        default:
            instruction = "неизвестно";
    }
    
    return `${swimmer.name} (${instruction})`;
}

function makeDistribution(distribution) {
    let result = '';
    
    for (const [escort, first, second] of distribution) {
        result += `${escort.name}: `;
        
        if (first) {
            result += getInstruction(first);
        }
        
        if (second) {
            result += `, ${getInstruction(second)}`;
        }
        
        result += '<br>';
    }
    
    return result;
}

function createDistribution(swimmers) {
    const escorts = [];
    const wards = [];
    
    // Separate escorts and wards
    for (const swimmer of swimmers) {
        if (swimmer.skill > 7 && swimmer.duration < 60) {
            escorts.push(swimmer);
        } else {
            wards.push(swimmer);
        }
    }
    
    // Validation checks
    if (escorts.length * 2 < wards.length) {
        return {
            success: false,
            message: "Невозможно распределить: Найдите больше сопровождающих"
        };
    }
    
    if (escorts.length + wards.length < 3) {
        return {
            success: false,
            message: "Невозможно распределить: Это не заплыв, а помощь с нырком"
        };
    }
    
    // Sort arrays
    escorts.sort((a, b) => {
        if (a.age !== b.age) return b.age - a.age;
        if (a.skill !== b.skill) return b.skill - a.skill;
        return b.duration - a.duration;
    });
    
    wards.sort((a, b) => {
        if (a.age !== b.age) return b.age - a.age;
        if (a.skill !== b.skill) return b.skill - a.skill;
        return b.duration - a.duration;
    });
    
    let escortsCounter = 0;
    const distribution = [];
    
    // Initialize distribution with escorts
    for (const escort of escorts) {
        distribution.push([escort, null, null]);
    }
    
    const wardsAmount = wards.length;
    const escortsAmount = escorts.length;
    
    // Assign wards to escorts
    if (wardsAmount > 0) {
        for (let wardCounter = 0; wardCounter < wardsAmount; wardCounter++) {
            if (escorts[escortsCounter].age > wards[wardCounter].age) {
                if (distribution[escortsCounter][1] === null) {
                    distribution[escortsCounter][1] = wards[wardCounter];
                } else if (distribution[escortsCounter][2] === null) {
                    distribution[escortsCounter][2] = wards[wardCounter];
                } else {
                    if (escortsCounter === 0) {
                        return {
                            success: false,
                            message: `Невозможно распределить! Найдите кого-то старше ${wards[wardCounter].age} лун`
                        };
                    } else {
                        escortsCounter--;
                        wardCounter--;
                        continue;
                    }
                }
            } else {
                if (escortsCounter === 0) {
                    return {
                        success: false,
                        message: `Невозможно распределить! Найдите кого-то старше ${wards[wardCounter].age} лун`
                    };
                } else {
                    escortsCounter--;
                    wardCounter--;
                    continue;
                }
            }
            
            escortsCounter = (escortsCounter + 1) % escortsAmount;
        }
    }
    
    // Count free escorts
    let freeEscorts = 0;
    for (const escort of distribution) {
        if (escort[1] === null) {
            freeEscorts++;
        }
    }
    
    // Handle single free escort
    if (freeEscorts === 1) {
        if (distribution[escortsAmount - 2][2] === null) {
            distribution[escortsAmount - 2][2] = escorts[escortsAmount - 1];
            distribution.splice(escortsAmount - 1, 1);
            
            return {
                success: true,
                distribution: makeDistribution(distribution)
            };
        } else {
            return {
                success: false,
                message: `Невозможно распределить: не хватает сопровождающего/подопечного для игрока по имени ${escorts[escortsAmount - 1].name}`
            };
        }
    }
    
    // Handle multiple free escorts
    let smallEscortsAmount = Math.floor(freeEscorts / 3);
    if (freeEscorts % 3 !== 0) {
        smallEscortsAmount++;
    }
    
    const escortsToWardsAmount = freeEscorts - smallEscortsAmount;
    const newEscortsAmount = escortsAmount - escortsToWardsAmount;
    let newEscortsCounter = escortsAmount - freeEscorts;
    
    const start = escortsAmount - escortsToWardsAmount;
    const end = escortsAmount - 1;
    
    for (let escortsToWardsCounter = start; escortsToWardsCounter <= end; escortsToWardsCounter++) {
        if (escorts[newEscortsCounter].age > escorts[escortsToWardsCounter].age) {
            if (distribution[newEscortsCounter][1] === null) {
                distribution[newEscortsCounter][1] = escorts[escortsToWardsCounter];
            } else if (distribution[newEscortsCounter][2] === null) {
                distribution[newEscortsCounter][2] = escorts[escortsToWardsCounter];
            } else {
                if (newEscortsCounter === escortsAmount - freeEscorts) {
                    return {
                        success: false,
                        message: `Невозможно распределить! Найдите кого-то старше ${escorts[escortsToWardsCounter].age} лун`
                    };
                } else {
                    newEscortsCounter--;
                    escortsToWardsCounter--;
                    continue;
                }
            }
        } else {
            if (newEscortsCounter === escortsAmount - freeEscorts) {
                return {
                    success: false,
                    message: `Невозможно распределить! Найдите кого-то старше ${escorts[escortsToWardsCounter].age} лун`
                };
            } else {
                newEscortsCounter--;
                escortsToWardsCounter--;
                continue;
            }
        }
        
        newEscortsCounter = (newEscortsCounter + 1) % newEscortsAmount;
        if (newEscortsCounter === 0) {
            newEscortsCounter = escortsAmount - freeEscorts;
        }
    }
    
    distribution.splice(newEscortsAmount);
    
    return {
        success: true,
        distribution: makeDistribution(distribution)
    };
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    
    const tableBody = document.getElementById('tableBody');
    let rowCounter = 0; // Start with 0 for the existing row
    
    // Add delete button to the first row
    const firstRow = tableBody.querySelector('tr');
    console.log('First row found:', firstRow);
    
    if (firstRow) {
        addDeleteButton(firstRow); // Make sure this executes
        console.log('Delete button added to first row');
    }
    
    // Function to add delete button to a row
    function addDeleteButton(row) {
        // Create a cell for the delete button
        const deleteCell = document.createElement('td');
        deleteCell.className = 'action-cell';
        
        // Create the delete button
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '&times;';  // HTML entity for × (multiplication sign)
        deleteButton.className = 'delete-button';
        deleteButton.type = 'button';
        deleteButton.title = 'Delete row';
        deleteButton.style.backgroundColor = '#dc3545';
        deleteButton.style.color = 'white';
        deleteButton.style.border = 'none';
        deleteButton.style.width = '30px';
        deleteButton.style.height = '30px';
        deleteButton.style.fontSize = '20px';
        deleteButton.style.borderRadius = '4px';
        deleteButton.style.cursor = 'pointer';
        
        deleteButton.addEventListener('click', function() {
            // Don't delete if it's the only row
            console.log('Delete button clicked');
            if (tableBody.querySelectorAll('.data-row').length > 1) {
                row.remove();
                console.log('Row removed');
            } else {
                console.log('Cannot remove last row');
            }
        });
        
        deleteCell.appendChild(deleteButton);
        row.appendChild(deleteCell);
        console.log('Delete button cell added to row');
    }
    
    // Function to add a new row
    function addNewRow() {
        rowCounter++;
        const newRow = document.createElement('tr');
        newRow.className = 'data-row';
        newRow.innerHTML = `
            <td><input type="text" class="name-input" name="swimmers[${rowCounter}][name]" placeholder="Имя" /></td>
            <td><input type="number" class="age-input" name="swimmers[${rowCounter}][age]" placeholder="Луны" /></td>
            <td>
                <select class="skill-select" name="swimmers[${rowCounter}][skill]">
                    <option value="">Выбрать</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                    <option value="9">9</option>
                </select>
            </td>
            <td><input type="number" class="duration-input" name="swimmers[${rowCounter}][duration]" placeholder="Переход" /></td>
        `;
        
        tableBody.appendChild(newRow);
        
        // Remove any validation attributes from the new inputs
        const newInputs = newRow.querySelectorAll('input, select');
        newInputs.forEach(input => {
            input.removeAttribute('required');
            input.setAttribute('novalidate', '');
        });
        
        // Add delete button to the new row
        addDeleteButton(newRow);
    }
    
    // Create the "Add Row" button
    const buttonContainer = document.querySelector('.button-container');
    console.log('Button container found:', buttonContainer);
    
    const addRowButton = document.createElement('button');
    addRowButton.textContent = 'добавить участника';
    addRowButton.className = 'add-row-button';
    addRowButton.type = 'button';
    addRowButton.addEventListener('click', function() {
        console.log('Add row button clicked');
        addNewRow();
    });
    
    // Insert the Add Row button before the submit button
    if (buttonContainer && buttonContainer.firstChild) {
        buttonContainer.insertBefore(addRowButton, buttonContainer.firstChild);
        console.log('Add row button inserted');
    } else if (buttonContainer) {
        buttonContainer.appendChild(addRowButton);
        console.log('Add row button appended');
    }

    // Make sure all inputs have required attribute removed
    const allInputs = document.querySelectorAll('input, select');
    allInputs.forEach(input => {
        input.removeAttribute('required');
    });

    // Add form submission handling
    const form = document.getElementById('swimmingForm');

    function cleanupEmptyRows() {
        const allRows = tableBody.querySelectorAll('.data-row');
        allRows.forEach(row => {
            const inputs = row.querySelectorAll('input, select');
            const allEmpty = Array.from(inputs).every(input => input.value.trim() === '');
            if (allEmpty) {
                row.remove();
            }
        });
        
        // Make sure we have at least one row
        if (tableBody.children.length === 0) {
            addNewRow();
        }
    }

    function collectSwimmersData() {
        const swimmers = [];
        const rows = tableBody.querySelectorAll('.data-row');
        
        rows.forEach(row => {
            const nameInput = row.querySelector('.name-input');
            const ageInput = row.querySelector('.age-input');
            const skillSelect = row.querySelector('.skill-select');
            const durationInput = row.querySelector('.duration-input');
            
            const name = nameInput.value.trim();
            const age = parseInt(ageInput.value);
            const skill = parseInt(skillSelect.value);
            const duration = parseInt(durationInput.value);
            
            // Only add swimmer if all fields are filled
            if (name && !isNaN(age) && !isNaN(skill) && !isNaN(duration)) {
                swimmers.push(new Swimmer(name, age, skill, duration));
            }
        });
        
        return swimmers;
    }

    function displayResult(result) {
        let responseDiv = document.getElementById('response-message');
        
        if (!responseDiv) {
            responseDiv = document.createElement('div');
            responseDiv.id = 'response-message';
            form.appendChild(responseDiv);
        }
        
        if (result.success) {
            responseDiv.className = 'success';
            responseDiv.innerHTML = result.distribution;
        } else {
            responseDiv.className = 'error';
            responseDiv.innerHTML = result.message;
        }
    }

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        cleanupEmptyRows();
        
        const swimmers = collectSwimmersData();
        
        if (swimmers.length === 0) {
            displayResult({
                success: false,
                message: "Пожалуйста, добавьте хотя бы одного участника с заполненными данными"
            });
            return;
        }
        
        const result = createDistribution(swimmers);
        displayResult(result);
    });
});