const currentURLArray = window.location.href.split("/");
const productCode = currentURLArray[currentURLArray.length - 2];
const discount = localStorage.getItem("discount") ? true : false;

const emailValue = document.querySelector("#client-email");
const mailVerifMessage = document.querySelector("#mail-verif-resp");
const sendCodeButton = document.querySelector("#validate-mail");
const emailValidated = false;

function emailVerif() {
  fetch("/sales/mail-code-validator", {
    method: "post",
    headers: { "Content-Type": "application/json" },
    cache: "no-cache",
    body: JSON.stringify({
      codeVerify: document.querySelector("#validate-code").value,
    }),
  })
    .then((resp) => resp.json())
    .then((resp) => {
      if (resp === "mail-verified") {
        document.querySelectorAll(".mail-verif-sel").forEach((element) => {
          element.remove();
        });

        document
          .getElementById("payment-form")
          .querySelectorAll("input")
          .forEach((element) => {
            element.disabled = false;
          });

        mailVerifMessage.innerHTML = "<h3>e-mail Verified</h3>";
      }

      if (resp === "invalid-code") {
        mailVerifMessage.innerHTML = "<h3>Invalid Code</h3>";
      }
    });
}

function emailCodeGen() {
  fetch("/sales/mail-validator", {
    method: "post",
    headers: { "Content-Type": "application/json" },
    cache: "no-cache",
    body: JSON.stringify({ verifyEmail: emailValue.value }),
  })
    .then((resp) => resp.json())
    .then((resp) => {
      if (resp === "valid") {
        if (document.querySelector("#validate-code")) {
          return null;
        }

        const numberInput = document.createElement("input");
        numberInput.setAttribute("type", "text");
        numberInput.setAttribute(
          "oninput",
          "this.value = this.value.replace(/[^0-9-]/g, '')"
        );
        numberInput.setAttribute("placeholder", "Insert Code Here");
        numberInput.setAttribute("id", "validate-code");
        numberInput.classList.add("mail-verif-sel");
        emailValue.after(numberInput);

        sendCodeButton.innerText = "Send New Code";

        const verifCodeButton = document.createElement("button");
        verifCodeButton.className = "buyButton";
        verifCodeButton.setAttribute("onclick", "emailVerif()");
        verifCodeButton.setAttribute("id", "validate-code");
        verifCodeButton.classList.add("mail-verif-sel");
        verifCodeButton.innerText = "Verificate Code";

        numberInput.after(verifCodeButton);
      }

      if (resp === "invalid") {
        mailVerifMessage.innerHTML = "<h3>Invalid email</h3>";

        setTimeout(() => {
          mailVerifMessage.innerHTML = "";
        }, 3000);
      }
    });

  mailVerifMessage.innerHTML = "<h3>Code Sent</h3>";
}

window.addEventListener("DOMContentLoaded", async () => {
  const { pubKey } = await fetch("/sales/sPubKey").then((resp) => resp.json());

  const stripe = Stripe(pubKey);

  const paymentIntendFetch = await fetch(
    `/sales/fpp/${productCode}/paymentIntend`,
    {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
    .then((resp) => resp.json())
    .then((resp) => {
      return resp;
    });

  let intendAmount = String(paymentIntendFetch.intendAmount);
  let intendAmountArray = [...intendAmount];
  intendAmountArray.splice(intendAmount.length - 2, 0, ".");
  const insertPrice = document.querySelector("#product-price");
  insertPrice.innerText = `Amount to Charge: USD$${intendAmountArray.join("")}`;
  const clientSecret = paymentIntendFetch.clientSecret;

  const appearance = {
    theme: "night",
    variables: {
      colorText: "#dadada",
      colorDanger: "#d63131",
      colorPrimary: "#ffea75",
      colorBackground: "#3d3d3d",
    },
  };

  const elements = stripe.elements({ clientSecret, appearance });

  const paymentElement = elements.create("payment", {
    layout: {
      type: "tabs",
      defaultCollapsed: false,
      radios: true,
      spacedAccordionItems: true,
    },
  });

  paymentElement.mount("#payment-element");

  const form = document.querySelector("#payment-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (discount !== false) {
      ;(async () => {
        const { error } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url:
              window.location.href.split("?")[0] + "/complete-checkout",
          },
        });

        if (error) {
          const messages = document.querySelector("#error-messages");
          messages.innerText = error.message;
        }
      })();
    } else {
      document
        .getElementById("payment-form")
        .querySelectorAll("input")
        .forEach((element) => {
          if (!element.value) {
            const message = document.querySelector("#error-messages");
            message.innerText = "Complete all the fields in the form";

            throw new Error("Fillout that shit!");
          }
        });

      const clientDataForm = {
        email: document.getElementById("client-email").value,
        firstName: document.getElementById("client-first-name").value,
        lastName: document.getElementById("client-last-name").value,
        country: document.getElementById("client-country").value,
        city: document.getElementById("client-city").value,
        phone: document.getElementById("client-phone").value,
        product: productCode,
        amount: intendAmountArray.join(""),
      };

      fetch("/sales/client-form", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-cache",
        body: JSON.stringify(clientDataForm),
      })
        .then((resp) => resp.json())
        .then(async (resp) => {
          if (resp === "form-received") {
            const { error } = await stripe.confirmPayment({
              elements,
              confirmParams: {
                return_url:
                  window.location.href.split("?")[0] + "/complete-checkout",
              },
            });

            if (error) {
              const messages = document.querySelector("#error-messages");
              messages.innerText = error.message;
            }
          }
        })
        .catch((e) => {
          alert("Please, try again or contact the administrator");
        });
    }
  });
});
