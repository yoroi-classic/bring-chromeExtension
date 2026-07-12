import { getTurnOff, setTurnOff, getPopupEnabled, setPopupEnabled } from "@yoroi-classic/bringweb3-chrome-extension-kit";

const optOutOff = document.querySelector("#false");
const optOutOn = document.querySelector("#true");

const popupEnabledOff = document.querySelector("#popupEnabledFalse");
const popupEnabledOn = document.querySelector("#popupEnabledTrue");

const update = async (value) => {
    const res = await setTurnOff(value)
    console.log(res);
    init()
}

optOutOff.addEventListener("click", () => {
    update(false)
})
optOutOn.addEventListener("click", () => {
    update(true)
})

popupEnabledOff.addEventListener("click", async () => {
    const res = await setPopupEnabled(false)
    console.log(res);
    init()
})
popupEnabledOn.addEventListener("click", async () => {
    const res = await setPopupEnabled(true)
    console.log(res);
    init()
})


const init = async () => {
    // Send message to background script
    const res = await getTurnOff()
    if (!res.isTurnedOff) {
        optOutOff.checked = true;
    } else {
        optOutOn.checked = true;
    }
    const isPopupEnabled = await getPopupEnabled()
    console.log('isPopupEnabled', isPopupEnabled, typeof isPopupEnabled);
    if (!isPopupEnabled.isPopupEnabled) {
        popupEnabledOff.checked = true;
    } else {
        popupEnabledOn.checked = true;
    }
}
init()
