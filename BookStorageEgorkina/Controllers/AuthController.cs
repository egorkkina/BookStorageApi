using BookStorage.Application;
using BookStore.Core.Abstractions;
using BookStorageEgorkina.Contracts;
using Microsoft.AspNetCore.Mvc;

namespace BookStorageEgorkina.Controllers;


[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IJwtService _jwtService;

    public AuthController(IUserService userService, IJwtService jwtService)
    {
        _userService = userService;
        _jwtService = jwtService;
    }
    
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] AuthRequest request)
    {
        try
        {
            var isValid = await _userService.ValidateUserCredentials(request.Email, request.Password);
            if (!isValid)
                return Unauthorized("Invalid email or password");

            var user = await _userService.GetUserByEmail(request.Email);
            if (user == null)
                return Unauthorized("User not found");

            var token = _jwtService.GenerateToken(user);
            
            return new AuthResponse(token, user.Id, user.Username, user.Role);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
    
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] UserRequest request)
    {
        try
        {
            var (user, error) = BookStore.Core.Models.User.Create(
                request.Username,
                request.Email,
                request.Password,
                request.Role);

            if (!string.IsNullOrEmpty(error))
                return BadRequest(error);

            var userId = await _userService.CreateUser(user);
            
            var token = _jwtService.GenerateToken(user);
            
            return new AuthResponse(token, user.Id, user.Username, user.Role);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}