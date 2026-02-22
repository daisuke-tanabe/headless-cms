# Common Patterns

## Skeleton Projects

When implementing new functionality:
1. Search for battle-tested skeleton projects
2. Use parallel agents to evaluate options:
   - Security assessment
   - Extensibility analysis
   - Relevance scoring
   - Implementation planning
3. Clone best match as foundation
4. Iterate within proven structure

## Design Patterns

### Repository Pattern

Encapsulate data access behind a consistent interface:
- Define standard operations: findAll, findById, create, update, delete
- Concrete implementations handle storage details (database, API, file, etc.)
- Business logic depends on the abstract interface, not the storage mechanism
- Enables easy swapping of data sources and simplifies testing with mocks

### Star Topology (Extension Independence)

Modules at the same layer must not depend on each other directly. Each module communicates only through the core (composition root, host, or shared interface):
- Routes do not import other routes
- Services do not import other services
- Stores do not import other stores
- Tools do not import other tools
- All wiring happens in the composition root via dependency injection

This keeps the dependency graph as a hub-and-spoke shape, avoiding N² coupling and cascading breakage.

### API Response Format

Use a consistent envelope for all API responses:
- Include a success/status indicator
- Include the data payload (nullable on error)
- Include an error message field (nullable on success)
- Include metadata for paginated responses (total, page, limit)
