# =============================================================
# skills.py
# Full TrailForge curriculum — 25 topics, all concepts defined.
# =============================================================

TOPICS = {

    # ── Beginner ──────────────────────────────────────────────

    "python_fundamentals": [
        "variables_and_data_types", "operators", "conditionals",
        "loops", "functions", "lists_and_tuples",
        "dictionaries", "file_handling", "exception_handling",
        "oop_basics",
    ],

    "javascript_basics": [
        "variables_and_data_types", "operators", "conditionals",
        "loops", "functions", "arrays",
        "objects", "dom_basics", "events",
        "async_basics",
    ],

    "java_programming": [
        "variables", "data_types", "operators",
        "conditions", "loops", "arrays",
        "methods", "oop", "inheritance",
        "polymorphism", "collections", "multithreading",
    ],

    "html_and_css": [
        "html_structure", "forms_and_inputs", "css_selectors",
        "box_model", "flexbox", "grid",
        "responsive_design", "css_animation_basics",
    ],

    "git_and_github": [
        "git_basics", "branching", "merging",
        "remote_repos", "pull_requests", "merge_conflicts",
        "git_workflow", "github_actions_basics",
    ],

    "linux_fundamentals": [
        "file_system_structure", "basic_commands", "file_permissions",
        "process_management", "package_management", "shell_scripting",
        "networking_commands", "users_and_groups",
    ],

    "prompt_engineering": [
        "what_is_a_prompt", "zero_shot_vs_few_shot", "instruction_design",
        "chain_of_thought", "role_prompting", "output_formatting",
        "prompt_iteration", "common_pitfalls",
    ],

    "data_analysis_python": [
        "numpy_basics", "pandas_basics", "data_cleaning",
        "data_visualization", "exploratory_data_analysis",
        "grouping_and_aggregation", "working_with_csv_excel",
        "intro_to_statistics",
    ],

    # ── Intermediate ──────────────────────────────────────────

    "data_structures_and_algorithms": [
        "arrays", "strings", "linked_lists",
        "stacks_and_queues", "recursion", "sorting",
        "searching", "trees", "graphs",
        "dynamic_programming",
    ],

    "operating_systems": [
        "processes_and_threads", "cpu_scheduling", "memory_management",
        "virtual_memory", "file_systems", "deadlocks",
        "synchronization", "io_systems",
    ],

    "computer_networks": [
        "osi_tcp_ip_models", "ip_and_mac_addressing", "routing",
        "switching", "tcp_and_udp", "dns",
        "http_and_https", "network_security_basics",
    ],

    "database_management": [
        "er_modeling", "relational_model", "sql_basics",
        "joins", "normalization", "transactions",
        "indexing", "concurrency_control",
    ],

    "react_development": [
        "jsx_and_components", "props_and_state", "event_handling",
        "hooks", "conditional_rendering", "lists_and_keys",
        "context_api", "routing",
    ],

    "nodejs_and_express": [
        "node_basics", "modules", "npm",
        "express_setup", "routing", "middleware",
        "error_handling", "connecting_a_database",
    ],

    "rest_api_design": [
        "http_methods", "status_codes", "resource_naming",
        "request_response_design", "authentication_jwt",
        "pagination_and_filtering", "versioning", "error_handling",
    ],

    "typescript_fundamentals": [
        "basic_types", "interfaces", "functions_and_typing",
        "classes", "generics", "union_and_intersection_types",
        "type_narrowing", "working_with_apis",
    ],

    "machine_learning_basics": [
        "what_is_ml", "data_preprocessing", "regression",
        "classification", "overfitting_and_underfitting",
        "model_evaluation", "decision_trees", "basic_neural_networks",
    ],

    "docker_and_containers": [
        "what_is_a_container", "images_vs_containers", "dockerfile_basics",
        "docker_compose", "volumes", "networking_in_docker",
        "container_registries", "orchestration_concepts",
    ],

    "web_application_security": [
        "owasp_vulnerabilities", "sql_injection", "xss",
        "csrf", "authentication_best_practices",
        "secure_session_management", "https_and_tls", "input_validation",
    ],

    "cloud_computing_basics": [
        "cloud_fundamentals", "iaas_paas_saas", "virtualization",
        "aws_azure_gcp_basics", "storage_services", "compute_services",
        "networking_basics", "security_and_iam",
    ],

    "react_native": [
        "react_native_basics", "components_and_styling", "navigation",
        "state_management", "handling_user_input", "apis_and_networking",
        "device_features", "building_and_deployment",
    ],

    # ── Advanced ──────────────────────────────────────────────

    "system_design": [
        "scalability_basics", "load_balancing", "caching",
        "database_scaling", "microservices_vs_monolith",
        "message_queues", "cap_theorem", "case_studies",
    ],

    "large_language_models": [
        "what_is_an_llm", "tokens_and_embeddings", "transformer_basics",
        "training_vs_finetuning", "context_windows",
        "hallucination", "use_cases", "limitations",
    ],

    "microservices_architecture": [
        "monolith_vs_microservices", "service_decomposition",
        "inter_service_communication", "api_gateway",
        "service_discovery", "data_management_patterns",
        "resilience_patterns", "deployment_and_orchestration",
    ],

    "deep_learning_fundamentals": [
        "neural_network_basics", "activation_functions",
        "forward_and_backpropagation", "loss_functions_and_optimizers",
        "cnns", "rnns", "overfitting_and_regularization",
        "training_best_practices",
    ],
}

# ── Difficulty tiers ──────────────────────────────────────────
DIFFICULTIES      = ["beginner", "intermediate", "advanced"]
DIFFICULTY_TO_IDX = {d: i for i, d in enumerate(DIFFICULTIES)}
IDX_TO_DIFFICULTY = {i: d for i, d in enumerate(DIFFICULTIES)}
NUM_DIFFICULTIES  = len(DIFFICULTIES)

DIFFICULTY_THRESHOLD = {
    "beginner":     -0.5,
    "intermediate":  0.0,
    "advanced":      0.5,
}

# Topic difficulty tier — affects simulator starting ability
TOPIC_DIFFICULTY = {
    "python_fundamentals":            "beginner",
    "javascript_basics":              "beginner",
    "java_programming":               "beginner",
    "html_and_css":                   "beginner",
    "git_and_github":                 "beginner",
    "linux_fundamentals":             "beginner",
    "prompt_engineering":             "beginner",
    "data_analysis_python":           "beginner",
    "data_structures_and_algorithms": "intermediate",
    "operating_systems":              "intermediate",
    "computer_networks":              "intermediate",
    "database_management":            "intermediate",
    "react_development":              "intermediate",
    "nodejs_and_express":             "intermediate",
    "rest_api_design":                "intermediate",
    "typescript_fundamentals":        "intermediate",
    "machine_learning_basics":        "intermediate",
    "docker_and_containers":          "intermediate",
    "web_application_security":       "intermediate",
    "cloud_computing_basics":         "intermediate",
    "react_native":                   "intermediate",
    "system_design":                  "advanced",
    "large_language_models":          "advanced",
    "microservices_architecture":     "advanced",
    "deep_learning_fundamentals":     "advanced",
}

# ── Helpers ───────────────────────────────────────────────────
def get_concepts(topic):
    if topic not in TOPICS:
        raise ValueError(f"Unknown topic: '{topic}'. Available: {list(TOPICS.keys())}")
    return TOPICS[topic]

def num_concepts(topic):      return len(TOPICS[topic])
def get_concept_to_idx(topic): return {c: i for i, c in enumerate(TOPICS[topic])}
def get_idx_to_concept(topic): return {i: c for i, c in enumerate(TOPICS[topic])}

if __name__ == "__main__":
    beginner     = [t for t, d in TOPIC_DIFFICULTY.items() if d == "beginner"]
    intermediate = [t for t, d in TOPIC_DIFFICULTY.items() if d == "intermediate"]
    advanced     = [t for t, d in TOPIC_DIFFICULTY.items() if d == "advanced"]

    print(f"Total topics:   {len(TOPICS)}")
    print(f"  Beginner:     {len(beginner)}")
    print(f"  Intermediate: {len(intermediate)}")
    print(f"  Advanced:     {len(advanced)}")
    print(f"\nTotal concepts: {sum(len(c) for c in TOPICS.values())}")

    print(f"\nAll topics:")
    for topic, concepts in TOPICS.items():
        tier = TOPIC_DIFFICULTY[topic]
        print(f"  [{tier:>12}]  {topic:<45} {len(concepts)} concepts")
