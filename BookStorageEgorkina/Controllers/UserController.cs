using BookStorageEgorkina.Contracts;
using BookStore.Core.Abstractions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookStorageEgorkina.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService;
    }
    
    [HttpGet]
    public async Task<ActionResult<List<UserResponse>>> GetAll()
    {
        var users = await _userService.GetUsers();

        var response = users
            .Select(u => new UserResponse(u.Id, u.Username, u.Email, u.Role));
        
        return Ok(response);
    }
    
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UserResponse>> GetUserById(Guid id)
    {
        var user = await _userService.GetUserById(id);
        if (user == null)
            return NotFound($"User with ID {id} not found");

        var response = new UserResponse(user.Id, user.Username, user.Email, user.Role);
        return Ok(response);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<Guid>> Create([FromBody] UserRequest request)
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
            return Ok(userId);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
    
    [Authorize(Roles = "Admin")]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<Guid>> Update(Guid id, [FromBody] UserRequest request)
    {
        try
        {
            var user = await _userService.UpdateUser(
                id, request.Username, request.Email, request.Role);

            return Ok(user);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
    
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        try
        {
            var userId = await _userService.DeleteUser(id);
            return Ok(userId);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }
    
    [HttpGet("email/{email}")]
    public async Task<ActionResult<UserResponse>> GetUserByEmail(string email)
    {
        var user = await _userService.GetUserByEmail(email);
        if (user == null)
            return NotFound($"User with email {email} not found");

        var response = new UserResponse(user.Id, user.Username, user.Email, user.Role);
        return Ok(response);
    }
    
    [HttpGet("profile")]
    public async Task<ActionResult<UserResponse>> GetMyProfile()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId == null || !Guid.TryParse(userId, out var userGuid))
            return Unauthorized();

        var user = await _userService.GetUserById(userGuid);
        if (user == null)
            return NotFound("User not found");

        var response = new UserResponse(user.Id, user.Username, user.Email, user.Role);
        return Ok(response);
    }
    
    
}