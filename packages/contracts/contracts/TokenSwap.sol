// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title TokenSwap
 * @dev A simple token swap contract that allows users to swap tokens
 */
contract TokenSwap is Ownable, ReentrancyGuard {
    // Mapping of token addresses to their exchange rates
    mapping(address => mapping(address => uint256)) public exchangeRates;
    
    // Events
    event SwapExecuted(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );
    
    event ExchangeRateSet(
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 rate
    );
    
    /**
     * @dev Constructor
     */
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Set the exchange rate between two tokens
     * @param tokenIn The address of the input token
     * @param tokenOut The address of the output token
     * @param rate The exchange rate (amount of tokenOut per tokenIn)
     */
    function setExchangeRate(
        address tokenIn,
        address tokenOut,
        uint256 rate
    ) external onlyOwner {
        require(tokenIn != address(0), "Invalid token address");
        require(tokenOut != address(0), "Invalid token address");
        require(rate > 0, "Rate must be greater than 0");
        
        exchangeRates[tokenIn][tokenOut] = rate;
        emit ExchangeRateSet(tokenIn, tokenOut, rate);
    }
    
    /**
     * @dev Swap tokens
     * @param tokenIn The address of the input token
     * @param tokenOut The address of the output token
     * @param amountIn The amount of input tokens to swap
     */
    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external nonReentrant {
        require(tokenIn != address(0), "Invalid token address");
        require(tokenOut != address(0), "Invalid token address");
        require(amountIn > 0, "Amount must be greater than 0");
        
        uint256 rate = exchangeRates[tokenIn][tokenOut];
        require(rate > 0, "Exchange rate not set");
        
        uint256 amountOut = (amountIn * rate) / 1e18;
        require(amountOut > 0, "Amount out must be greater than 0");
        
        // Transfer tokens from user to this contract
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        
        // Transfer tokens from this contract to user
        IERC20(tokenOut).transfer(msg.sender, amountOut);
        
        emit SwapExecuted(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
    }
    
    /**
     * @dev Get the exchange rate between two tokens
     * @param tokenIn The address of the input token
     * @param tokenOut The address of the output token
     * @return The exchange rate
     */
    function getExchangeRate(
        address tokenIn,
        address tokenOut
    ) external view returns (uint256) {
        return exchangeRates[tokenIn][tokenOut];
    }
    
    /**
     * @dev Get the amount of output tokens for a given amount of input tokens
     * @param tokenIn The address of the input token
     * @param tokenOut The address of the output token
     * @param amountIn The amount of input tokens
     * @return The amount of output tokens
     */
    function getAmountOut(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external view returns (uint256) {
        uint256 rate = exchangeRates[tokenIn][tokenOut];
        if (rate == 0) return 0;
        return (amountIn * rate) / 1e18;
    }
} 