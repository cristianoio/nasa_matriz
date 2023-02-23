using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using System.Text;

namespace Selenium.UnitTest
{
    [TestClass]
    public class UnitTest2
    {
            private static IWebDriver driver;
            private StringBuilder verificationErrors;
            private static string baseURL;
            private bool acceptNextAlert = true;

            [ClassInitialize]
            public static void InitializeClass(TestContext testContext)
            {
                var option = new ChromeOptions()
                {
                    BinaryLocation = @"C:\Program Files\Google\Chrome\Application\chrome.exe"
                };

                //option.AddArgument("--headless");
                driver = new ChromeDriver(option);
                //driver = new ChromeDriver();
                baseURL = "https://www.katalon.com/";
            }

            [ClassCleanup]
            public static void CleanupClass()
            {
                try
                {
                    //driver.Quit();// quit does not close the window
                    driver.Close();
                    driver.Dispose();
                }
                catch (Exception)
                {
                    // Ignore errors if unable to close the browser
                }
            }

            [TestInitialize]
            public void InitializeTest()
            {
                verificationErrors = new StringBuilder();
            }

            [TestCleanup]
            public void CleanupTest()
            {
                Assert.AreEqual("", verificationErrors.ToString());
            }

            [TestMethod]
            public void TestMovimentos()
            {
                var driver = new ChromeDriver();
                var navigate = driver.Navigate();
                navigate.GoToUrl("http://localhost:8080/"); //works
                driver.FindElement(By.Id("entrada")).Click();
                driver.FindElement(By.Id("entrada")).Clear();
                driver.FindElement(By.Id("entrada")).SendKeys("MRMRMLMLMRMRMLMLMMMLMLMRMRMLMLMRMRMMRMMMM");
                driver.FindElement(By.Id("inicial")).Click();
                driver.FindElement(By.Id("inicial")).Clear();
                driver.FindElement(By.Id("inicial")).SendKeys("11N");
                driver.FindElement(By.XPath("//input[@value='Validar']")).Click();

                Assert.IsNotNull(driver.FindElement(By.XPath("//pre[contains(text(),'97.5609756097561')]")));
            }


            [TestMethod]
            public void TestMelhorSolucaoMovimentos()
            {
                driver.Navigate().GoToUrl("http://localhost:8080/");
                driver.FindElement(By.Id("entrada")).Click();
                driver.FindElement(By.Id("entrada")).Clear();
                driver.FindElement(By.Id("entrada")).SendKeys("MMMMRMRMMMMLMLMMMMMRMRMMMMLMLMMMM");
                driver.FindElement(By.Id("inicial")).Click();
                driver.FindElement(By.Id("inicial")).Clear();
                driver.FindElement(By.Id("inicial")).SendKeys("11N");
                driver.FindElement(By.XPath("//input[@value='Validar']")).Click();

                Assert.IsNotNull(driver.FindElement(By.XPath("//pre[contains(text(),'80.48780487804879')]")));
            }

            [TestMethod]
            public void TestMelhorSolucaoRotacoes()
            {
                driver.Navigate().GoToUrl("http://localhost:8080/");
                driver.FindElement(By.Id("entrada")).Click();
                driver.FindElement(By.Id("entrada")).Clear();
                driver.FindElement(By.Id("entrada")).SendKeys("MMMMRMRMMMMLMLMMMMMRMRMMMMLMLMMMM");
                driver.FindElement(By.Id("inicial")).Click();
                driver.FindElement(By.Id("inicial")).Clear();
                driver.FindElement(By.Id("inicial")).SendKeys("11N");
                driver.FindElement(By.XPath("//input[@value='Validar']")).Click();

                Assert.IsNotNull(driver.FindElement(By.XPath("//pre[contains(text(),'24.242424242424242')]")));
            }
        }
    }
