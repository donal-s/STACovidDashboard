import dashboard from "../pageobjects/dashboardPage";

describe("Regional Insights", () => {
  it("should have correct title", () => {
    dashboard.open();
    dashboard.navbarLinkRegionalInsights.click();
    let title = "Scottish COVID-19 Statistics";
    expect(browser).toHaveTitle(title);
    expect(dashboard.imgLogo).toBeDisplayed();
    expect(dashboard.headingTitle).toHaveText("Scottish COVID-19 Statistics");
    expect(dashboard.headlineBanner).toHaveTextContaining(
      "Regional Restrictions to help fight the pandemic"
    );
  });
});
