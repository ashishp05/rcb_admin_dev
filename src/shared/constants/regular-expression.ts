/* eslint-disable no-useless-escape */
export const RegularExpression = {
    Email: new RegExp(
        /^(?=.{1,64}@)(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(?=.{1,255}$)((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))\s*$/,
    ),
    MobileNumber: new RegExp(/^[0-9]\d{9}$/),
    IndianMobile: new RegExp(/^[6-9]\d{9}$/),
    // Backend rule: 8+ characters with at least one letter and one digit.
    StaffPassword: new RegExp(/^(?=.*[A-Za-z])(?=.*\d).{8,128}$/),
    OfferCode: new RegExp(/^[A-Za-z0-9_-]{3,32}$/),
    FullName: new RegExp(/^[a-zA-Z]+(?:\s[a-zA-Z]+)*$/),
    AlphaNumeric: new RegExp(/^[A-Za-z0-9]*[A-Za-z][A-Za-z0-9]*$/),
    AlphaNumericSpace: new RegExp(/^[A-Za-z0-9 ]+$/),
    Numeric: new RegExp(/^(0|[1-9][0-9]*)$/),
    PanCard: new RegExp(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/),
    AddharCard: new RegExp(/^[0-9]{12}$/),
    Address: new RegExp(/^(?! )[a-zA-Z0-9\s.,#-]+$/i),
    Description: new RegExp(/^[^\s].*\S$/),
};