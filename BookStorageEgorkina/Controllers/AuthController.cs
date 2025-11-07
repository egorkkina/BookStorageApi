using BookStorage.Application;
using BookStore.Core.Abstractions;
using BookStorageEgorkina.Contracts;
using Microsoft.AspNetCore.Mvc;

namespace BookStorageEgorkina.Controllers;


[ApiController]
[Route("api/[controller]")]
public class AuthController(IUserService userService, IJwtService jwtService) : ControllerBase
{
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] AuthRequest request)
    {
        try
        {
            var isValid = await userService.ValidateUserCredentials(request.Email, request.Password);
            if (!isValid)
                return Unauthorized("Invalid email or password");

            var user = await userService.GetUserByEmail(request.Email);
            if (user == null)
                return Unauthorized("User not found");

            var token = jwtService.GenerateToken(user);
            
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
                Guid.NewGuid(), 
                request.Username,
                request.Email,
                request.Password,
                request.Role);

            if (!string.IsNullOrEmpty(error))
                return BadRequest(error);

            var userId = await userService.CreateUser(user);
            
            var token = jwtService.GenerateToken(user);
            
            return new AuthResponse(token, user.Id, user.Username, user.Role);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}