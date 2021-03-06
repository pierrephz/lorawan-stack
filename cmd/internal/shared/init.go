// Copyright © 2019 The Things Network Foundation, The Things Industries B.V.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package shared

import (
	"context"

	"go.thethings.network/lorawan-stack/v3/pkg/config"
)

// Initialize global packages.
func Initialize(ctx context.Context, config *config.ServiceBase) error {
	// Fallback to the default Redis configuration for the cache system
	if config.Cache.Redis.IsZero() {
		config.Cache.Redis = config.Redis
	}
	// Fallback to the default Redis configuration for the events system
	if config.Events.Redis.IsZero() {
		config.Events.Redis = config.Redis
	}

	if err := InitializeEvents(ctx, *config); err != nil {
		return err
	}
	return nil
}
