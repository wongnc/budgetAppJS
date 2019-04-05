//BUDGET CONTROLLER
var budgetController = (function() {
    //function constructors
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    //expense method to calculate the percentage of each item 
    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else{
            this.percentage = -1;
        }   
    };
    
    //returns the percentage
    Expense.prototype.getPercentage = function(){
      return this.percentage;  
    };
    
    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var calculateTotal = function(type) {
        var sum = 0;
        //iterate over array and add to the sum
        data.allItems[type].forEach(function(currentElement){
            sum += currentElement.value;
        });
        //set the sum to either total exp or inc
        data.totals[type] = sum;
    };

    //data structures
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals:{
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
    
    return {
        addItem: function(type, des, val){
            var newItem, ID;
            //[1,2,3,4,5], next ID = 6
            //[1,2,4,6,8], next Id = 9 
            //ID = last ID + 1
            
            //Create new ID
            if(data.allItems[type].length >0){
                ID = data.allItems[type][data.allItems[type].length -1].id + 1;
            } else {
                ID = 0;
            }; 
            
            //Create new item based on 'inc' or 'exp' type
            if(type === 'exp'){
                newItem = new Expense(ID, des, val);
            } else if(type ==='inc'){
                newItem = new Income(ID, des, val);
            };
            //Pushes data based on type to the data structure exp or inc.
            data.allItems[type].push(newItem);
            
            //Return the new element
            return newItem;
        },
        
        deleteItem: function(type, id){
            var ids, index;
            
            //id = 6
            //ids = [1,2,3,6,8]
            //index = 3
            
            //create new array of index items
            ids = data.allItems[type].map(function(current){
               return current.id; 
            });
            
            //finds index of id we are searching for
            index = ids.indexOf(id);
            
            if(index !== -1){
                //removes 1 element at the index chosen
                data.allItems[type].splice(index, 1)
            }
            
        },
    
        calculateBudget: function(){
            
            //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            //calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            
            //calculate the percentage of expenses if positive income
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },
        
        calculatePercentages: function(){
            
            /*
            a=20
            b=10
            c=40
            income = 100
            a=20/100=20%
            b=10/100=10%
            c=40/100=40%
            */
            
            //forEach loops through each item and performs the method
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
        },
        
        getPercentages: function(){
            //map loops through each item, performs methd and stores it in an array
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            //returns the array
            return allPerc;
        },
        
        getBudget: function(){
            return{
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        
        testing: function(){
            console.log(data);
        }
    };
    
})();



//UI CONTROLLER
var UIController = (function() {
    //store input types in an object
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
        
    };
    
    var formatNumber = function(num, type){
            //+ or - before number
            //2 decimal points
            //comma separating the thousands
            //2310.4567 -> + 2,310.46
            
            var numSplit, int, dec, type;
            
            //rounds number up
            num = Math.abs(num);
            //adds 2 decimal to num string
            num = num.toFixed(2);
            
            //splits number into 2 parts left and right of decimal
            numSplit = num.split('.');
            //first part of num before decimal
            int = numSplit[0];
            
            if(int.length > 3){
                int = int.substr(0, int.length - 3) + ',' + int.substr(int.length-3, 3);
            }
            
            //2nd part of number after decimal
            dec = numSplit[1];
            
            //ternary operator to assign + or - based on type
            return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
        };
    
    var nodeListForEach = function(list, callback){
        for (var i = 0; i<list.length; i++){
            callback(list[i], i);
        }
    };
    
    return {
        //function to return user input as an object
        getInput: function(){
            return {
                type: document.querySelector(DOMstrings.inputType).value, //either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                //parseFloat converts a string to a number
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)  
            };   
        },

        //Create HTML string with placeholder text
        addListItem: function(obj, type){
            var html, newHtml, element;
            
            if(type === 'inc'){
               element = DOMstrings.incomeContainer;
                
               html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div> </div> </div>'; 
            } else if (type ==='exp'){
                element = DOMstrings.expensesContainer;
                 
                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"><div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            }
                        
            //Replace the origional HTML placeholder (id,description,value) text with actual input data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            //Insert the newHtml into the income/expense container as a child element before element closing tag 
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        
        deleteListItem: function(selectorID){
            
            //select itemID in DOM and then removeChild of that same itemID
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        
        //clear description and value field after entering 
        clearFields: function(){
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            
            //convert list to array to be able to use array methods
            fieldsArr = Array.prototype.slice.call(fields);
            //sets value to blank
            fieldsArr.forEach(function(current, index, array){
                current.value = "";
                
            });
            
            //return focus to description field 
            fieldsArr[0].focus();
        },
        
        displayBudget: function(obj){
            var type;
            //ternary operator to determine type
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp,'exp');
            //display % on expenses in top area html
            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }

        },
        
        //display percentages of expenses in list
        displayPercentages: function(percentages){
          
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            
            //calls nodeListForEach function using fields and callback function
            nodeListForEach(fields, function(current,index){
                if(percentages[index]>0){
                    current.textContent = percentages[index] + '%';
                } else{
                    current.textContent = '---';
                }                
            });
            
        },
        
        //display month and year in UI
        displayMonth: function(){
            var now, month, months, year;
            
            now = new Date();
            
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']; 
            month = now.getMonth();
            
            year = now.getFullYear();
            //select index of months based on now.getMonths()
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        
        changedType: function(){
            
            //these fields will receive red focus class
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
            
            nodeListForEach(fields, function(cur){
               cur.classList.toggle('red-focus'); 
            });
            
            document.querySelector(DOMstrings.inputButton).classList.toggle('red');
        },
        
        //make DOMstrings public to Global App
        getDOMstrings: function(){
            return DOMstrings;
        }
    };
    
})();




//GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {
    
    var setupEventListeners = function(){
        //accessible to DOMstring variable from UI Controller
        var DOM = UICtrl.getDOMstrings();
        
        //perform ctrlAddItem when button clicked
        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);
    
        //perform ctrlAddItem when enter is clicked
        document.addEventListener('keypress', function(event){ 
            if (event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            } 
        });
        
        //set event listener for event delegation on container class
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };
    
    var updateBudget = function(){
        
        //1. Calculate the budget
        budgetCtrl.calculateBudget();
        
        //2. Return the budget
        var budget = budgetCtrl.getBudget();
        
        //3. Display budget on the UI
        UICtrl.displayBudget(budget);
    };
    
    
    var updatePercentages = function(){
        
        //1. calculate percentages
        budgetCtrl.calculatePercentages();
        
        //2. read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        
        //3. update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    };
    
    var ctrlAddItem = function(){
        var input, newItem;
        
        //1. get the field input data
        input = UICtrl.getInput();
        //description is not empty and value is a number (not NaN)
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
            //2. add item to budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //3. add item to user interface
            UICtrl.addListItem(newItem, input.type);

            //4. clear the fields
            UICtrl.clearFields();

            //5. Calculate and update budget
            updateBudget();
            
            //6. Calculate and update percentages
            updatePercentages();
        }  
    };
    
    //function to delete item in list when icon clicked 
    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID;
        
        //click target element where event is fired and find id
        itemID= event.target.parentNode.parentNode.parentNode.parentNode.id; 
        
        if(itemID){
            
            //splitting type and id so we can traverse it in DOM
            splitID = itemID.split('-');
            type = splitID[0];
            //convert string to integer
            ID = parseInt(splitID[1]);
            
            //1. delete item from data structure
            budgetCtrl.deleteItem(type, ID);
            
            //2. delete item from user interface
            UICtrl.deleteListItem(itemID);
            
            //3. update and show new budget
            updateBudget();
            
            //4. Calculate and update percentages
            updatePercentages();
        }
    };
    
    return {
        init: function(){
            console.log('application started');
            UICtrl.displayMonth();
            //display initial values to 0
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }
    
})(budgetController, UIController);

controller.init();






