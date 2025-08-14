package com.maranatha.sfmaranatha.e2e;

import org.junit.jupiter.api.*;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.time.Duration;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class LoginE2ETest {

    private static WebDriver driver;
    private static WebDriverWait wait;
    private static final String BASE_URL = "http://localhost:8080";

    @BeforeAll
    static void setUp() {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless"); // Para CI/CD
        options.addArguments("--no-sandbox");
        options.addArguments("--disable-dev-shm-usage");
        
        driver = new ChromeDriver(options);
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    @AfterAll
    static void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    @Test
    @Order(1)
    @DisplayName("Usuario puede hacer login como cliente")
    void testLoginCliente() {
        // Navigate to login
        driver.get(BASE_URL + "/login.html");
        
        // Fill form
        WebElement emailInput = wait.until(
            ExpectedConditions.presenceOfElementLocated(By.id("email"))
        );
        emailInput.sendKeys("cliente@test.com");
        
        WebElement passwordInput = driver.findElement(By.id("contraseña"));
        passwordInput.sendKeys("password123");
        
        // Submit
        WebElement submitButton = driver.findElement(By.cssSelector("button[type='submit']"));
        submitButton.click();
        
        // Verify redirect to dashboard
        wait.until(ExpectedConditions.urlContains("/dashboard-cliente.html"));
        Assertions.assertTrue(driver.getCurrentUrl().contains("dashboard-cliente"));
    }

    @Test
    @Order(2)
    @DisplayName("Usuario puede hacer un pedido")
    void testRealizarPedido() {
        // Navigate to menu
        driver.get(BASE_URL + "/gestion-de-menus.html");
        
        // Add item to cart
        WebElement addButton = wait.until(
            ExpectedConditions.elementToBeClickable(By.className("add-to-cart"))
        );
        addButton.click();
        
        // Go to checkout
        WebElement checkoutButton = wait.until(
            ExpectedConditions.elementToBeClickable(By.id("ir-A-pago"))
        );
        checkoutButton.click();
        
        // Select delivery option
        WebElement deliveryOption = wait.until(
            ExpectedConditions.elementToBeClickable(By.id("pedidoDomicilio"))
        );
        deliveryOption.click();
        
        // Verify form appears
        WebElement form = wait.until(
            ExpectedConditions.presenceOfElementLocated(By.id("pedidoForm"))
        );
        Assertions.assertTrue(form.isDisplayed());
    }
}