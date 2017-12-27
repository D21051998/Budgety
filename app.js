//Bugdet Controller
var budgetController = (() => {
	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};
	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};
	Expense.prototype.calcPercentage = function(totalIncome) {
		if (totalIncome > 0) {
			this.percentage = Math.round(this.value / totalIncome * 100);
		} else {
			this.percentage = -1;
		}
	};

	Expense.prototype.getPercentage = function() {
		return this.percentage;
	};

	var calculateTotal = type => {
		var sum = 0;
		data.allItems[type].forEach(current => {
			sum += current.value;
		});
		data.totals[type] = sum;
	};

	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1
	};

	return {
		addItem: function(type, des, val) {
			var newItem, ID;
			//ID = lastID+1;
			if (data.allItems[type].length == 0) ID = 0;
			else ID = data.allItems[type][data.allItems[type].length - 1].id + 1;

			if (type === "exp") {
				newItem = new Expense(ID, des, val);
			} else if (type === "inc") {
				newItem = new Income(ID, des, val);
			}

			data.allItems[type].push(newItem);
			return newItem;
		},

		deleteItem: function(id, type) {
			var ids, index;
			ids = data.allItems[type].map(function(current) {
				return current.id;
			});
			console.log(id);
			index = ids.indexOf(id);
			if (index !== -1) {
				data.allItems[type].splice(index, 1);
			}
		},

		calculateBudget: () => {
			// Calculate total income and expenses
			calculateTotal("exp");
			calculateTotal("inc");

			// Calculate the budget = income - expenses
			data.budget = data.totals.inc - data.totals.exp;
			if (data.totals.inc > 0) {
				data.percentage = Math.round(data.totals.exp / data.totals.inc * 100);
			} else {
				data.percentage = -1;
			}
			// Calculate the percentage of income that we spent
		},

		calculatePercentages: function() {
			data.allItems.exp.forEach(current => {
				current.calcPercentage(data.totals.inc);
			});
		},

		getPercentages: function() {
			var allPercentages = data.allItems.exp.map(function(cur) {
				return cur.getPercentage();
			});
			return allPercentages;
		},

		getBudget: function() {
			return {
				budget: data.budget,
				percentage: data.percentage,
				totalIncome: data.totals.inc,
				totalExpense: data.totals.exp
			};
		},
		testing: function() {
			console.log(data);
		}
	};
})();

//UI Controller
var UIController = (() => {
	var DOMStrings = {
		inputType: ".add__type",
		inputDescription: ".add__description",
		inputValue: ".add__value",
		inputBtn: ".add__btn",
		incomeContainer: ".income__list",
		expensesContainer: ".expenses__list",
		budgetLabel: ".budget__value",
		incomeLabel: ".budget__income--value",
		expenseLabel: ".budget__expenses--value",
		percentageLabel: ".budget__expenses--percentage",
		container: ".container",
		expensesPercentageLabel: ".item__percentage",
		dateLabel: ".budget__title--month"
	};
	var formatNumber = function(num, type) {
		var numSplit, int, dec, sign;
		num = Math.abs(num);
		num = num.toFixed(2);

		numSplit = num.split(".");
		int = numSplit[0];
		if (int.length > 3) {
			int =
				int.substr(0, int.length - 3) +
				"," +
				int.substr(int.length - 3, int.length);
		}
		dec = numSplit[1];
		return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
	};
	var nodeListForEach = function(list, callback) {
		for (var i = 0; i < list.length; i++) {
			callback(list[i], i);
		}
	};
	return {
		getInput: () => {
			return {
				type: document.querySelector(DOMStrings.inputType).value, //will be either inc or exp.
				description: document.querySelector(DOMStrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
			};
		},

		displayPercentages: function(percentages) {
			var fields = document.querySelectorAll(
				DOMStrings.expensesPercentageLabel
			);

			nodeListForEach(fields, function(current, index) {
				current.textContent =
					percentages[index] > 0 ? percentages[index] + "%" : "---";
			});
		},
		displayMonth: function() {
			var now, year, month, months;
			months = [
				"January",
				"February",
				"March",
				"April",
				"May",
				"June",
				"July",
				"August",
				"September",
				"October",
				"November",
				"December"
			];
			now = new Date();
			year = now.getFullYear();

			month = now.getMonth();
			document.querySelector(DOMStrings.dateLabel).textContent =
				months[month] + ", " + year;
		},

		getDOMStrings: () => {
			return DOMStrings;
		},

		changeType: function() {
			var fields = document.querySelectorAll(
				DOMStrings.inputType +
					"," +
					DOMStrings.inputDescription +
					"," +
					DOMStrings.inputValue
			);
			nodeListForEach(fields, function(cur) {
				cur.classList.toggle("red-focus");
			});
			document.querySelector(DOMStrings.inputBtn).classList.toggle("red");
		},

		addListItem: (obj, type) => {
			var html, newHtml, element;
			//Create HTML String with placeholder text
			if (type === "inc") {
				element = DOMStrings.incomeContainer;
				html =
					'<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			} else if (type === "exp") {
				element = DOMStrings.expensesContainer;
				html =
					'<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}
			//Replace the placeholder text with some actual data
			newHtml = html.replace("%id%", obj.id);
			newHtml = newHtml.replace("%description%", obj.description);
			newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

			//Insert the HTML into DOM
			document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
		},

		displayBudget: obj => {
			var type;
			obj.budget > 0 ? (type = "inc") : (type = "exp");
			console.log(obj.budget);
			document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(
				obj.budget,
				type
			);
			document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(
				obj.totalIncome,
				"inc"
			);
			document.querySelector(
				DOMStrings.expenseLabel
			).textContent = formatNumber(obj.totalExpense, "exp");

			if (obj.percentage > 0) {
				document.querySelector(DOMStrings.percentageLabel).textContent =
					obj.percentage + "%";
			} else {
				document.querySelector(DOMStrings.percentageLabel).textContent = "---";
			}
		},

		deleteListItem: selectorID => {
			var element = document.getElementById(selectorID);
			element.parentNode.removeChild(element);
		},

		clearFields: () => {
			var fields, fieldsArray;
			fields = document.querySelectorAll(
				DOMStrings.inputDescription + ", " + DOMStrings.inputValue
			);
			fieldsArray = Array.prototype.slice.call(fields);
			fieldsArray.forEach((current, index, array) => {
				current.value = "";
			});
			fieldsArray[0].focus();
		}
	};
})();

//Global App Controller
var controller = ((budgetCtrl, UICtrl) => {
	var setupEventListeners = () => {
		var DOM = UICtrl.getDOMStrings();

		document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

		document
			.querySelector(DOM.container)
			.addEventListener("click", ctrlDeleteItem);
		document.addEventListener("keypress", event => {
			if (event.keyCode === 13) {
				ctrlAddItem();
			}
		});

		document
			.querySelector(DOM.inputType)
			.addEventListener("change", UICtrl.changeType);
	};

	var updateBudget = () => {
		//1. Calculate the budget
		budgetCtrl.calculateBudget();
		//2. Returns the budget
		var budget = budgetCtrl.getBudget();
		//3. Display the budget on the UI
		UICtrl.displayBudget(budget);
		console.log(budget);
	};

	var updatePercentages = () => {
		//1. Calculate percentage
		budgetCtrl.calculatePercentages();
		//2. Read percentage from the budget controller
		var percentages = budgetCtrl.getPercentages();
		//3. Update the UI with the new percentages
		console.log(percentages);
		UICtrl.displayPercentages(percentages);
	};

	var ctrlAddItem = () => {
		//1. Get the filled input data
		var input, newItem;
		input = UIController.getInput();
		if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
			//2. Add the item to the budget controller
			newItem = budgetCtrl.addItem(input.type, input.description, input.value);

			//3. Add the item to the UI
			UICtrl.addListItem(newItem, input.type);

			//4. Clear the fields
			UICtrl.clearFields();

			//5. Calculate and Update the budget and percentages
			updateBudget();
			updatePercentages();
		}
	};
	var ctrlDeleteItem = event => {
		var itemID, splitID, type, ID;

		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
		if (itemID) {
			splitID = itemID.split("-");
			type = splitID[0];
			ID = splitID[1];
			//1. Delete the item from the data
			budgetCtrl.deleteItem(parseInt(ID), type);

			//2. Delete the item from the UI
			UICtrl.deleteListItem(itemID);

			//3. Update and show the new budget and percentages
			updateBudget();
			updatePercentages();
		}
	};
	return {
		init: function() {
			console.log("Application");
			setupEventListeners();
			UICtrl.displayBudget({
				budget: 0,
				percentage: -1,
				totalIncome: 0,
				totalExpense: 0
			});
			UICtrl.displayMonth();
		}
	};
})(budgetController, UIController);

controller.init();
