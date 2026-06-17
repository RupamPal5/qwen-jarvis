def validate_search_replace_block(search: str, replace: str) -> bool:
    """
    Validate the structure of Aider-style search/replace blocks.

    Args:
        search (str): The search block
        replace (str): The replace block

    Returns:
        bool: True if the structure is valid
    """
    try:
        # Check search block structure
        search_lines = search.split('\n')
        if not (search_lines[0].strip() == "<<<<<<< SEARCH" or
                search_lines[0].startswith("<<<<<<< SEARCH")):
            return False

        # Find the ======= divider
        divider_index = -1
        for i, line in enumerate(search_lines):
            if line.strip() == "=======":
                divider_index = i
                break

        if divider_index == -1:
            return False

        # Check replace block structure
        replace_lines = replace.split('\n')
        if not (replace_lines[-1].strip() == ">>>>>>> REPLACE" or
                replace_lines[-1].startswith(">>>>>>> REPLACE")):
            return False

        return True
    except Exception:
        return False
