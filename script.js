/*
CO4: State Architecture

Concept: State Persistence & Retrieval

Retrieves user data stored in localStorage
and displays it on page load.
*/
window.onload = function () {

    const name =
        localStorage.getItem("userName");

    if (name) {

        document.getElementById(
            "welcomeMessage"
        ).innerText =
            "Welcome, " + name;
    }
};
/*
CO3: React Component Model

Concept: Deterministic UI Function

For the same inputs,
the calculator produces
the same output score.
*/

function calculateScore() {

    let income =
        parseInt(
            document.getElementById("income").value
        );

    let totalEmi =
        parseInt(
            document.getElementById("totalEmi").value
        );

    let latePayments =
        parseInt(
            document.getElementById("latePayments").value
        );

    let creditLimit =
        parseInt(
            document.getElementById("creditLimit").value
        );

    let usedCredit =
        parseInt(
            document.getElementById("usedCredit").value
        );

    let loans =
        parseInt(
            document.getElementById("loans").value
        );
        /*
CO5: Form Engineering

Concept: Validation Pipeline

Prevents invalid repayment history input.
*/

    if (latePayments > totalEmi) {
        alert(
            "Late payments cannot exceed total EMIs."
        );
        return;
    }
    /*
CO5: Form Engineering

Concept: Error Surface & Validation

Prevents impossible credit utilization values.
*/

    if (usedCredit > creditLimit) {
        alert(
            "Used credit cannot exceed total credit limit."
        );
        return;
    }

    let score = 300;
    /*
CO2: JavaScript Engineering

Concept: ES6 Arrays & Dynamic Data Handling

Stores runtime feedback messages
for the user.
*/

    let reasons = [];

    if (income > 100000) {
        score += 150;
    }
    else if (income > 50000) {
        score += 100;
    }
    else {
        score += 50;
        reasons.push(
            "Low monthly income may affect repayment capability."
        );
    }
    /*
CO4: State Architecture

Concept: Derived State

Repayment percentage is calculated
from existing user inputs.
*/

    let repaymentPercent =
        ((totalEmi - latePayments) / totalEmi) * 100;

    if (repaymentPercent >= 95) {
        score += 250;
    }
    else if (repaymentPercent >= 80) {
        score += 180;
        reasons.push(
            "Some late EMI payments were detected."
        );
    }
    else if (repaymentPercent >= 60) {
        score += 100;
        reasons.push(
            "Frequent late EMI payments reduced your score."
        );
    }
    else {
        score += 30;
        reasons.push(
            "Poor repayment history is heavily affecting your score."
        );
    }

    let usage =
        (usedCredit / creditLimit) * 100;

    if (usage < 30) {
        score += 180;
    }
    else if (usage < 50) {
        score += 120;
        reasons.push(
            "Moderate credit card usage detected."
        );
    }
    else if (usage < 75) {
        score += 60;
        reasons.push(
            "High credit utilization is lowering your score."
        );
    }
    else {
        score += 20;
        reasons.push(
            "Very high credit card usage negatively impacts your score."
        );
    }

    if (loans === 0) {
        score += 120;
    }
    else if (loans <= 2) {
        score += 80;
    }
    else if (loans <= 5) {
        score += 40;
        reasons.push(
            "Multiple active loans increase credit risk."
        );
    }
    else {
        score -= 20;
        reasons.push(
            "Too many active loans are severely affecting your score."
        );
    }

    if (score > 900) {
        score = 900;
    }

    let status = "";

    if (score >= 750) {
        status = "Excellent";
    }
    else if (score >= 650) {
        status = "Good";
    }
    else if (score >= 550) {
        status = "Average";
    }
    else {
        status = "Poor";
    }

    document.getElementById(
        "resultBox"
    ).style.display = "block";
    /*
CO1: Foundations of Front-End Engineering

Concept: Imperative DOM Manipulation

JavaScript directly updates
the user interface.
*/

    document.getElementById(
        "score"
    ).innerText = score;

    document.getElementById(
        "status"
    ).innerText = status;

    const reasonsList =
        document.getElementById(
            "reasonsList"
        );

    reasonsList.innerHTML = "";

    if (reasons.length === 0) {

        const li =
            document.createElement("li");

        li.innerText =
            "Your financial profile looks healthy.";

        reasonsList.appendChild(li);
    }
    else {
        /*
CO2: JavaScript Engineering

Concept: Functional Programming

Uses array iteration to dynamically
render feedback messages.
*/

        reasons.forEach(function (reason) {

            const li =
                document.createElement("li");

            li.innerText = reason;

            reasonsList.appendChild(li);
        });
    }
}
